import { runCodeAgent } from "@core/agents/codeAgent";
import { runFileAgent } from "@core/agents/fileAgent";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import runCommand from "./tools/runCliCommand";
import { makeToolCallingDecision } from "./tools/makeToolCallingDecision";
import { llm } from "@llm/gemini";
import { confirmAction } from "./tools/confirmAction";
import goalPlanner from "./tools/goalPlanner";

const cliCommand = tool(runCommand, {
  name: "run_cli-command",
  description: "Executes terminal commands like installing packages, running scripts, or system operations",
  schema: z.object({
    command: z.string().describe("The CLI command to be executed in the user's terminal environment"),
  }),
});

const toolCallingDecision = tool(makeToolCallingDecision, {
  name: "tool_calling_decision",
  description: "Analyzes a user task and recommends which agent or tool to use with detailed instructions",
  schema: z.object({
    task: z.string().describe("A natural language task or instruction from the user"),
  }),
});

const codeAgentTool = tool(runCodeAgent, {
  name: "code_agent",
  description: "Handles code-related tasks: editing functions, refactoring code, generating new modules or logic",
  schema: z.object({
    prompt: z.string().describe("A code-related instruction, request, or intent from the user"),
  }),
});

const fileAgentTool = tool(runFileAgent, {
  name: "file_agent",
  description: "Handles file system operations: creating files/folders, reading/writing content, searching paths",
  schema: z.object({
    prompt: z.string().describe("A file or folder related instruction, such as 'create index.ts in src'"),
  }),
});

const getFeedback = tool(confirmAction, {
  name: "get_user_feaeback",
  description: "Ask the user to confirm or override an AI decision before executing a tool or agent",
  schema: z.object({
    decision: z.string().describe("The decision or action the AI wants confirmation for"),
  }),
});

const executionGoalPlanner = tool(goalPlanner, {
  name: "execution_goal_planner",
  description: "Given a high-level project goal, this tool generates a structured, step-by-step execution plan with precise actions (e.g., runCommand, writeFile, installPackage) suitable for automated agents.",
  schema: z.object({
    goal: z.string().describe("A natural language description of what the user wants to build or accomplish, such as 'Create a blog using Next.js and TailwindCSS with a contact form and dark mode'."),
  }),
});

export const tools = [
  executionGoalPlanner,
  getFeedback,
  cliCommand,
  codeAgentTool,
  fileAgentTool,
];

export const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
export const llmWithTools = llm.bindTools(tools);
