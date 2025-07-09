import { runCodeAgent } from "@core/agents/codeAgent";
import { runFileAgent } from "@core/agents/fileAgent";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import runCommand from "./tools/runCliCommand";
import { makeToolCallingDecision } from "./tools/makeToolCallingDecision";
import { llm } from "@llm/gemini";
import { confirmAction } from "./tools/confirmAction";
import goalPlanner from "./tools/goalPlanner";
import { fileTools } from "../fileAgent/fileTools";
import { codeTools } from "../codeAgent/CodeTools";
import { webSearch } from "./tools/webSearch";

const cliCommand = tool(runCommand, {
  name: "run_cli-command",
  description: "Executes terminal commands like installing packages, running scripts, or system operations",
  schema: z.object({
    command: z.string().describe("The CLI command to be executed in the user's terminal environment"),
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

const searchOnWeb = tool(webSearch, {
  name: "web_search",
  description: "Searches the web for up-to-date information relevant to a user query. Useful when additional context, tutorials, latest documentation, or troubleshooting solutions are needed.",
  schema: z.object({
    query: z.string().describe("The natural language search string the user would type into a search engine, such as 'How to set up Tailwind with Vite in React' or 'Best way to handle file uploads in Next.js'.")
  }),
});

export const tools = [
  executionGoalPlanner,
  searchOnWeb,
  getFeedback,
  cliCommand,
  ...fileTools,
  ...codeTools
  // codeAgentTool,
  // fileAgentTool,
];

export const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
export const llmWithTools = llm.bindTools(tools);
