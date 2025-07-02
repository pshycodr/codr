// src/core/agents/codeAgent.ts

import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatMessage, HumanMessage } from "@langchain/core/messages";
import { codeTools, llmWithCodeTools } from "./CodeTools"
import chalk from "chalk";

// LLM call node for planning and reasoning
async function llmCodeAgent(state: typeof MessagesAnnotation.State) {
  const result = await llmWithCodeTools.invoke([
    {
      role: "system",
      content: `
      You are Codr, a highly skilled AI software engineer with deep expertise in codebase analysis, refactoring, generation, and documentation.
      You have access to the following tools to help with code tasks:
      ${codeTools.map(t => `- ${t.name}: ${t.description}`).join("\n")}

      Always utilize your tools smartly with smart and accurate inputs. 
      make sure when you are calling each tool, you are giving correct input.

      Your core responsibilities:

      1. **Metadata Awareness**: Always begin by checking if the codebase is indexed (use generate_codebase_metadata if not). You rely on static metadata and vector embeddings to understand code structure.
      2. **Context Reasoning**: Use get_context, get_call_graph, and get_context_by_query to gather precise info about functions, classes, or files before taking actions.
      3. **Structured Planning**: Break large tasks into small logical steps. For each step, state the reasoning, the tool used, and expected outcome.
      4. **Safe Edits**: For editing or deleting code, always reference line numbers from metadata. Ensure edits do not overlap or corrupt other code blocks.
      5. **Autonomous Execution**: Think independently. Unless information is missing, do not ask follow-up questions — proceed to solve the task using tools.
      6. **Output Clarity**: For every step, show the executed operation, affected file, and line ranges (if any). Log final result clearly.
      7. **Resilience**: If a tool fails, explain the failure and try an alternative approach.

      Format your output like:
      Step 1: "Analyzing codebase with get_context..."
      Step 2: "Using edit_code to update function X..."
      ...
      ✅ Task complete: Updated login handler to validate password format.
      `
    },
    ...state.messages,
  ]);

  return { messages: [result] };
}

// Decision point: Does LLM want to take tool action?
function shouldTakeToolAction(state: typeof MessagesAnnotation.State) {
  const last = state.messages.at(-1);
  // @ts-ignore
  return last?.tool_calls?.length ? "Tool" : "__end__";
}

// Build the LangGraph agent graph
const codeAgentGraph = new StateGraph(MessagesAnnotation)
  .addNode("llmCall", llmCodeAgent)
  .addNode("Tool", new ToolNode(codeTools))
  .addEdge("__start__", "llmCall")
  .addConditionalEdges("llmCall", shouldTakeToolAction, {
    Tool: "Tool",
    __end__: "__end__",
  })
  .addEdge("Tool", "llmCall");

const codeAgentApp = codeAgentGraph.compile();


export async function runCodeAgent(input: string | { prompt: string }) {
  const prompt = typeof input === "string" ? input : input.prompt;

  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid input: prompt must be a non-empty string.");
  }

  console.log(chalk.bgYellow.black("⚡ Code Agent Invoked:"), prompt);

  try {
    const result = await codeAgentApp.invoke(
      {
        messages: [new HumanMessage(prompt)],
      },
      {
        recursionLimit: 50,
      }
    );

    console.log(chalk.green("✅ Code Agent Finished"));
    // console.dir(result, { depth: 10, colors: true });

    const finalMessage = result.messages.at(-1) as ChatMessage;
    console.log(chalk.cyan("📦 Final Output:"), finalMessage?.content);
    return finalMessage?.content;
  } catch (err) {
    console.error(chalk.bgRed.white("🔥 Code Agent Error:"), err);
    throw err;
  }
}