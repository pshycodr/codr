import {runCodeAgent} from "@core/agents/codeAgent"
import { runFileAgent } from "@core/agents/fileAgent"


import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Base tools
import runCommand from "./tools/runCliCommand";
import { makeToolCallingDecision } from "./tools/makeToolCallingDecision";
import { llm } from "@llm/gemini";
import { confirmAction } from "./tools/confirmAction";


/**
 * Tool: Executes any CLI command (e.g., npm install, git init).
 */
const cliCommand = tool(runCommand, {
  name: "run_cli-command",
  description: "Executes terminal commands like installing packages, running scripts, or system operations",
  schema: z.object({
    command: z.string(),
  }),
});

/**
 * Tool: Makes intelligent decisions on which tool or agent should be used based on the user's task.
 */
const toolCallingDecision = tool(makeToolCallingDecision, {
  name: "tool_calling_decision",
  description: "Analyzes a user task and recommends which agent or tool to use with detailed instructions",
  schema: z.object({
    task: z.string(),
  }),
});

/**
 * Tool: Delegates complex code generation, editing, or reasoning to the Code Agent.
 */
const codeAgentTool = tool(runCodeAgent, {
  name: "code_agent",
  description: "Handles code-related tasks: editing functions, refactoring code, generating new modules or logic",
  schema: z.object({
    prompt: z.string(),
  }),
});

/**
 * Tool: Delegates file/folder management to the File Agent.
 */
const fileAgentTool = tool(runFileAgent, {
  name: "file_agent",
  description: "Handles file system operations: creating files/folders, reading/writing content, searching paths",
  schema: z.object({
    prompt: z.string(),
  }),
});

const confirmTool = tool(confirmAction, {
    name: "confirm_action",
    description: "Take feedback from the userAsk the user to confirm or override an AI decision before executing a tool or agent",
    schema: z.object({
      decision: z.string(), // The decision string the AI made, shown to the user
    }),
  });

// Export tool array
export const tools = [
//   toolCallingDecision,
  confirmTool,
  cliCommand,
  codeAgentTool,
  fileAgentTool,
];

// Map for quick lookup by name
export const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
export const llmWithTools = llm.bindTools(tools);