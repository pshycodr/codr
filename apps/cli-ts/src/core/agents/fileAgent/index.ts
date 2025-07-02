import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { fileTools, llmWithFileTools } from "./fileTools"; // Adjust path to your tools
import { ChatMessage } from "@langchain/core/messages";
import chalk from "chalk";

/**
 * LLM Node — Think & Decide
 * The LLM reviews current conversation state and decides what to do next.
 */
async function fileAgentLLM(state: typeof MessagesAnnotation.State) {
  const result = await llmWithFileTools.invoke([
    {
      role: "system",
      content: `
You are FileAgent, an autonomous software automation assistant for managing file systems and project structures.

Your role is to help users **create, edit, read, organize, and search files or folders** within a codebase.

### Tools Available:
${fileTools.map(t => `- ${t.name}: ${t.description}`).join("\n")}

---

## ⚙️ Core Operating Principles

1. **Autonomous Execution**  
   - Assume the user has given enough detail. Proceed without asking unless something critical is missing.

2. **Step-by-Step Reasoning**  
   - Break tasks into clear steps and explain each decision you make.

3. **Tool-First Mentality**  
   - Always use a tool if it matches the task. Do not try to generate raw shell code or content yourself unless no tool fits.

4. **Security**  
   - Always use **relative paths**. Never write or read outside the working directory (./).

5. **Error Handling**  
   - Handle potential errors gracefully. Use \'read_file\` or \`run_cli-command\` for debugging or diagnostics if needed.

6. **Memory-Aware Execution**  
   - Remember previous actions in the current session and avoid repeating work or overwriting files unnecessarily.

---

## 🧠 Response Format

Respond in structured steps, such as:

1. **Plan**: Describe your high-level plan.
2. **Steps**: For each step, specify:
   - What you're doing
   - Why you're doing it
   - Which tool you're using
3. **Execution**: Show commands, inputs, or file names used
4. **Results**: Log output, file contents, or confirmations
5. **Final Summary**: Confirm completion of the task.

Always be precise, clean, and deterministic.
      `,
    },
    ...state.messages,
  ]);

  return { messages: [result] };
}

/**
 * Conditional edge function — decide if we need to act (tool call) or exit
 */
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages.at(-1);
  // @ts-ignore
  return lastMessage?.tool_calls?.length ? "Action" : "__end__";
}

/**
 * Graph Definition
 */
const agentGraph = new StateGraph(MessagesAnnotation)
  .addNode("FileAgentLLM", fileAgentLLM)
  .addNode("Tools", new ToolNode(fileTools))
  .addEdge("__start__", "FileAgentLLM")
  .addConditionalEdges("FileAgentLLM", shouldContinue, {
    Action: "Tools",
    __end__: "__end__",
  })
  .addEdge("Tools", "FileAgentLLM");

/**
 * Compile the LangGraph App
 */
const fileAgentApp = agentGraph.compile();

/**
 * Entry Point to Run File Agent
 */
export async function runFileAgent(input: string | { prompt: string }) {
  const prompt = typeof input === "string" ? input : input.prompt;

  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid input: prompt must be a non-empty string.");
  }

  console.log(chalk.bgYellow.black("⚡ File Agent Invoked:"), prompt);

  try {
    const result = await fileAgentApp.invoke(
      {
        messages: [new HumanMessage(prompt)],
      },
      {
        recursionLimit: 50,
      }
    );

    console.log(chalk.green("✅ File Agent Finished"));
    // console.dir(result, { depth: 10, colors: true });

    const finalMessage = result.messages.at(-1) as ChatMessage;
    console.log(chalk.cyan("📦 Final Output:"), finalMessage?.content);
    return finalMessage?.content;
  } catch (err) {
    console.error(chalk.bgRed.white("🔥 File Agent Error:"), err);
    throw err;
  }
}