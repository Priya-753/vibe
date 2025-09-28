import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
        const sandbox = await Sandbox.create("vibe-nextjs-1759023284");
        return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
        name: "codeAgent",
        system: "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js and React snippets.",
        model: openai({ model: "gpt-4o" }),
      });

      const { output } = await codeAgent.run(
        `Write a simple Next.js and React snippet that ${event.data.value}`,
      );
      console.log(output);
      
      const sandboxUrl = await step.run("get-sandbox-url", async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `http://${host}`;
      });

    return { output, sandboxUrl };
  },
); 