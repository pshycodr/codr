import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llmWithTools, tools } from "./tools";
import { fileTools } from "../fileAgent/fileTools";
import { codeTools } from "../codeAgent/CodeTools";
import { isSystemMessage } from "@langchain/core/messages";

/**
 * Master LLM node: decides what to do based on the user prompt and available tools.
 */

async function llmCall(state: typeof MessagesAnnotation.State) {
  const isFirstCall = state.messages.length <= 2; // system + user

  const messagesToSend = isFirstCall
    ? state.messages
    : state.messages.filter(m => !isSystemMessage(m));

  const result = await llmWithTools.invoke(messagesToSend);
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
export async function runMasterAgent({userPrompt, systemPrompt}:{userPrompt: string, systemPrompt: any }) {
  // console.log(app.getGraph().drawMermaid());
  
  const result = await app.invoke(
    { messages: [ new SystemMessage(systemPrompt), new HumanMessage(userPrompt)] },
    { recursionLimit: 1000 }
  );

  const finalMessage = result.messages.at(-1);
  const content = finalMessage?.content ?? "[No output from agent]";
  console.log(content);
  return content;
}
