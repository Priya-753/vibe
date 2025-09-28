import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure
    .input(z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
    }))
    .query(async ({ input }) => {
        const messages = await prisma.message.findMany({
            orderBy: {
                updatedAt: "asc",
            },
            include: {
                fragment: true,
            },
            where: {
                projectId: input.projectId,
            },
        });
        return messages;
    }),
  create: baseProcedure
    .input(z.object({
        value: z.string().min(1, { message: "Value is required" }).max(10000, { message: "Value must be less than 10000 characters" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
    }))
    .mutation(async ({ input }) => {
        const newMessage = await prisma.message.create({
            data: {
                projectId: input.projectId,
                content: input.value,
                role: MessageRole.USER,
                type: MessageType.RESULT,
            },
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value,
                projectId: input.projectId,
            },
        });

        return newMessage;
    }),
});