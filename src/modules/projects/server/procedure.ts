import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";

export const projectsRouter = createTRPCRouter({
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