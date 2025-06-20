#!/usr/bin/env bun
console.log("codr CLI is alive.");
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import {
    SystemMessage,
    ToolMessage,
    HumanMessage
} from "@langchain/core/messages";
import { llmWithTools, tools } from "./nodes";
import { ToolNode } from "@langchain/langgraph/prebuilt";


// Nodes
async function llmCall(state: typeof MessagesAnnotation.State) {
    // LLM decides whether to call a tool or not
    const result = await llmWithTools.invoke([
        {
            role: "system",
            content: `
            You are an expert software developer specializing in efficient and secure software solutions. Your primary goal is to fulfill user requests by creating, modifying, and managing files and folders within a project directory. You have access to the following tools:
            ${tools.map(t => `- ${t.name}: ${t.description}`).join("\n")}
            
            Crucial Directives:
            
            1. Autonomous Operation: You are designed to operate independently. You will meticulously analyze user requests and proactively determine the best course of action without seeking clarification from the user. Assume you have all necessary information unless explicitly stated otherwise.
            2. Process-Oriented Execution: Adhere to a structured problem-solving approach. Break down complex tasks into smaller, manageable steps. Document your reasoning for each step.
            3. Tool Maximization: Utilize available tools judiciously and strategically. Select the most appropriate tools for each task to optimize efficiency and effectiveness.
            4. Command Compliance: Execute user requests precisely and accurately. Pay close attention to detail and ensure that the final result aligns perfectly with the specified requirements.
            5. Security Focus: Prioritize security best practices. Always use relative file paths to mitigate potential security vulnerabilities.
            6. Error handling: Anticipate potential errors, and implement error handling, using run_cli_command and read_file to debug and validate.
            7. Context retention: Remember previous steps and decisions to maintain consistency and avoid redundant operations.
            
            Response Format:
            
            - Begin by outlining your plan to address the user request.
            - For each step, clearly state the action you are taking, the tool you are using, and the reasoning behind your choice.
            - Provide the exact command or code snippet you are executing.
            - If necessary, display the output of commands or the content of files.
            - Conclude by summarizing the outcome of your actions and confirming that the user request has been fulfilled.
            `

        },
        ...state.messages
    ]);

    return {
        messages: [result]
    };
}

const toolNode = new ToolNode(tools)

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages.at(-1);

    // If the LLM makes a tool call, then perform an action
    // @ts-ignore
    if (lastMessage?.tool_calls?.length) {
        return "Action";
    }
    // Otherwise, we stop (reply to the user)
    return "__end__";
}

const agentBuilder = new StateGraph(MessagesAnnotation)
    .addNode("llmCall", llmCall)
    .addNode("tools", toolNode)
    // Add edges to connect nodes
    .addEdge("__start__", "llmCall")
    .addConditionalEdges(
        "llmCall",
        shouldContinue,
        {
            // Name returned by shouldContinue : Name of next node to visit
            "Action": "tools",
            "__end__": "__end__",
        }
    )
    .addEdge("tools", "llmCall")

const app = agentBuilder.compile()


const args = process.argv.slice(2);
let command = args.join(' ');

// Invoke
const messages = [new HumanMessage(`${command}`)];
const result = await app.invoke({ messages }, {recursionLimit: 50});
// console.log(app.getGraph().drawMermaid());

console.log(result.messages.at(-1)?.content);




