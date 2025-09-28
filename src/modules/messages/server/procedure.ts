import { MessageRole, MessageType } from "@/generated/prisma";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/database";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure
    .query(async () => {
        const messages = await prisma.message.findMany({
            orderBy: {
                updatedAt: "asc",
            },
            include: {
                fragment: true,
            },
        });
        return messages;
    }),
  create: baseProcedure
    .input(z.object({
      value: z.string().min(1, { message: "Message value is required" }),
    }))
    .mutation(async ({ input }) => {
        const newMessage = await prisma.message.create({
            data: {
                content: input.value,
                role: MessageRole.USER,
                type: MessageType.RESULT,
            },
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value,
            },
        });

        return newMessage;
    }),
});