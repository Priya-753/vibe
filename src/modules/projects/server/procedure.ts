import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "ID is required" }),
        }))
        .query(async ({ input, ctx }) => {
            const project = await prisma.project.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
            });

            if (!project) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }
            return project;
        }),
    getMany: protectedProcedure
        .query(async ({ ctx }) => {
            const projects = await prisma.project.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
                where: {
                    userId: ctx.auth.userId,
                },
            });
            return projects;
        }),
    create: protectedProcedure
        .input(z.object({
            value: z.string()
                .min(1, { message: "Value is required" })
                .max(10000, { message: "Value must be less than 10000 characters" }),
        }))
        .mutation(async ({ input, ctx }) => {
            const createdProject = await prisma.project.create({
                data: {
                    name: generateSlug(2, {
                        format: "kebab",
                    }),
                    userId: ctx.auth.userId,
                    messages: {
                        create: {
                            content: input.value,
                            role: MessageRole.USER,
                            type: MessageType.RESULT,
                        },
                    },
                },
            });

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: createdProject.id,
                },
            });

            return createdProject;
        }),
});