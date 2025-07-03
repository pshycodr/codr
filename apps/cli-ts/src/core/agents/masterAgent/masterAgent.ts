import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { llmWithTools, tools } from "./tools";
import { fileTools } from "../fileAgent/fileTools";
import { codeTools } from "../codeAgent/CodeTools";

/**
 * Master LLM node: decides what to do based on the user prompt and available tools.
 */
async function llmCall(state: typeof MessagesAnnotation.State) {
  const result = await llmWithTools.invoke([
    {
      role: "system",
      content: `
      You are an expert Tool manager and task execustioner. Your primary goal is to fulfill user requests by Smartly Choosing what tool to use or What Agent to Call. You have access to the following tools:
      Your Tools:
      ${tools.map(t => `- ${t.name}: ${t.description}`).join("\n")}

      File Agent's Tools:
      ${fileTools.map(ft => `- ${ft.name}: ${ft.description}`).join("\n")}

      Code Agent Tools:
      ${codeTools.map(ct => `- ${ct.name}: ${ct.description}`).join("\n")}
      
      ALWAYS REMEMBER : if you want user feedback use confirmAction tool.
      Crucial Directives:
      1. Allways Call the Agents with a proper detailed instruction and tools to use.
      2. Allways try to use the tools you have smartly 
   ` 
    },
    ...state.messages,
  ]);

  return { messages: [result] };
}

/**
 * Determines whether to take another action or end the graph.
 */
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const last = state.messages.at(-1);
  // @ts-ignore
  return last?.tool_calls?.length ? "Action" : "__end__";
}

/**
 * LangGraph definition for Master Agent
 */
const agentGraph = new StateGraph(MessagesAnnotation)
  .addNode("llmCall", llmCall)
  .addNode("tools", new ToolNode(tools))
  .addEdge("__start__", "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, {
    Action: "tools",
    __end__: "__end__",
  })
  .addEdge("tools", "llmCall");

const app = agentGraph.compile();

/**
 * Entrypoint to invoke the Master Agent
 */
export async function runMasterAgent(prompt: string) {
  const result = await app.invoke(
    { messages: [new HumanMessage(prompt)] },
    { recursionLimit: 100 }
  );

  const finalMessage = result.messages.at(-1);
  const content = finalMessage?.content ?? "[No output from agent]";
  console.log(content);
  return content;
}
