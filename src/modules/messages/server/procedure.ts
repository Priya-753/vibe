import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";
import { RateLimiterRes } from "rate-limiter-flexible";

export const messagesRouter = createTRPCRouter({
    getMany: protectedProcedure
    .input(z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
    }))
    .query(async ({ input, ctx }) => {
        const messages = await prisma.message.findMany({
            orderBy: {
                updatedAt: "asc",
            },
            include: {
                fragment: true,
            },
            where: {
                projectId: input.projectId,
                project: {
                    userId: ctx.auth.userId,
                },
            },
        });
        return messages;
    }),
  create: protectedProcedure
    .input(z.object({
        value: z.string().min(1, { message: "Value is required" }).max(10000, { message: "Value must be less than 10000 characters" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
    }))
    .mutation(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: {
                id: input.projectId,
                userId: ctx.auth.userId,
            },
        });
        if (!project) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        try {
            await consumeCredits();
        } catch (error) {
            if (error instanceof RateLimiterRes) {
                throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You have reached the maximum number of requests. Please upgrade to a paid plan." });
            }
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
        }

        const newMessage = await prisma.message.create({
            data: {
                projectId: project.id,
                content: input.value,
                role: MessageRole.USER,
                type: MessageType.RESULT,
            },
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value,
                projectId: project.id,
            },
        });

        return newMessage;
    }),
});