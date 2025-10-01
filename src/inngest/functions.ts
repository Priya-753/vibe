import { openai, createAgent, createTool, createNetwork, Tool, Message, createState } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "./utils";
import prisma from "@/lib/database";
import { MessageRole, MessageType } from "@/generated/prisma";

interface AgentState {
    summary: string;
    files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/run" },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-1759023284");
            // await sandbox.setTimeout(60000 * 10 * 3);
            return sandbox.sandboxId;
        });

        const previousMessages = await step.run("get-previous-messages", async () => {
            const formatMessages: Message[] = [];
            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            });
            for (const message of messages) {
                formatMessages.push({
                    type: "text",
                    role: message.role === MessageRole.USER ? "user" : "assistant",
                    content: message.content,
                });
            }
            return formatMessages.reverse();
        });

        const state = createState<AgentState>({
            summary: "",
            files: {},
        },
    {
        messages: previousMessages,
    });

        const codeAgent = createAgent<AgentState>({
            name: "codeAgent",
            description: "An expert coding agent.",
            system: PROMPT,
            model: openai({ model: "gpt-4.1", defaultParameters: { temperature: 0.1 } }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use this tool to run terminal commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }, { step }) => {

                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: "", stderr: "" };

                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data;
                                    },
                                });
                                return `Command ${command} succeeded: ${result.stdout}`;
                            } catch (error) {
                                console.error(`Command ${command} failed: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
                                return `Command ${command} failed: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                            }
                        });
                    }
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Use this tool to create or update files in the sandbox",
                    parameters: z.object({
                        files: z.array(z.object({
                            path: z.string(),
                            content: z.string(),
                        })),
                    }),
                    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                for (const file of files) {
                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }
                                return updatedFiles;
                            } catch (error) {
                                console.error(`Error creating or updating files: ${error}`);
                                return `Error creating or updating files: ${error}`;
                            }
                        });

                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Use this tool to read files in the sandbox",
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }
                                return JSON.stringify(contents);
                            } catch (error) {
                                console.error(`Error reading files: ${error}`);
                                return `Error reading files: ${error}`;
                            }

                        });
                    }
                })
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantTextMessage = lastAssistantTextMessageContent(result);
                    if (lastAssistantTextMessage && network) {
                        if (lastAssistantTextMessage.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantTextMessage;
                        }
                    }

                    return result;
                }
            }
        });

        const network = createNetwork<AgentState>({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
                return codeAgent
            }
        });

        const result = await network.run(event.data.value, {state});

        const fragmentTitle = createAgent({
            name: "fragmentTitle",
            description: "An assistant that generates a short, descriptive title for a code fragment based on its <task_summary>.",
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({ model: "gpt-4.1", defaultParameters: { temperature: 0.1 } }),
        });

        const reponseGenerator = createAgent({
            name: "reponseGenerator",
            description: "An assistant that generates a short, user-friendly message explaining what was just built, based on the <task_summary> provided by the other agents.",
            system: RESPONSE_PROMPT,
            model: openai({ model: "gpt-4.1", defaultParameters: { temperature: 0.1 } }),
        });

        const { output: fragmentTitleOutput } = await fragmentTitle.run(result.state.data.summary);
        const { output: reponseGeneratorOutput } = await reponseGenerator.run(result.state.data.summary);

        const generatedTitle = () => {
            if (fragmentTitleOutput[0].type !== "text") {
                return "Fragment";
            }

            if (Array.isArray(fragmentTitleOutput[0].content)) {
                return fragmentTitleOutput[0].content.map((content) => content.text).join("");
            } else {
                return fragmentTitleOutput[0].content as string;
            }
        }

        const generatedResponse = () => {
            if (reponseGeneratorOutput[0].type !== "text") {
                return "Here you go";
            }

            if (Array.isArray(reponseGeneratorOutput[0].content)) {
                return reponseGeneratorOutput[0].content.map((content) => content.text).join("");
            } else {
                return reponseGeneratorOutput[0].content as string;
            }
        }

        const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);
            return `http://${host}`;
        });

        await step.run("save-result", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "Something went wrong. Please try again.",
                        role: MessageRole.ASSISTANT,
                        type: MessageType.ERROR,
                    },
                });
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: generatedResponse(),
                    role: MessageRole.ASSISTANT,
                    type: MessageType.RESULT,
                    fragment: {
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: generatedTitle(),
                            files: result.state.data.files,
                        },
                    },
                },
            });
        });

        return { url: sandboxUrl, title: generatedTitle(), files: result.state.data.files, summary: generatedResponse() };
    },
); 