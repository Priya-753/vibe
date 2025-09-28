import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure
    .input(z.object({
        id: z.string().min(1, { message: "ID is required" }),
    }))
    .query(async ({ input }) => {
        const project = await prisma.project.findUnique({
            where: {
                id: input.id,
            },
        });

        if (!project) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return project;
    }),
    getMany: baseProcedure
    .query(async () => {
        const projects = await prisma.project.findMany({
            orderBy: {
                updatedAt: "desc",
            },
        });
        return projects;
    }),
  create: baseProcedure
    .input(z.object({
      value: z.string()
      .min(1, { message: "Value is required" })
      .max(10000, { message: "Value must be less than 10000 characters" }),
    }))
    .mutation(async ({ input }) => {
        const createdProject = await prisma.project.create({
            data: {
                name: generateSlug(2, {
                    format: "kebab",
                }),
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