import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { llm } from "@llm/llm";

// File operation handlers
import createFolder from "./tools/files/createFolders";
import createFiles from "./tools/files/createFiles";
import readFile from "./tools/files/readFile";
import writeFile from "./tools/files/writeFile";
import findFile from "./tools/files/findFile";

// CLI and tool routing
import runCommand from "./tools/runCommand";

/**
 * Tool: Create a new folder at a specified path.
 */
const makeFolder = tool(createFolder, {
  name: "create_folder",
  description: "Creates a new folder at the given path",
  schema: z.object({
    path: z.string(),
  }),
});

/**
 * Tool: Run any shell or CLI command.
 */
const cliCommand = tool(runCommand, {
  name: "run_cli-command",
  description: "Executes any command in the CLI (e.g., install packages, run scripts)",
  schema: z.object({
    command: z.string(),
  }),
});

/**
 * Tool: Create multiple empty files inside a specified folder.
 */
const makeFiles = tool(createFiles, {
  name: "make_files",
  description: "Creates empty files in a specified folder",
  schema: z.object({
    folder: z.string(),
    files: z.array(z.string()),
  }),
});

/**
 * Tool: Read the content of a file.
 */
const readFiles = tool(readFile, {
  name: "read_file",
  description: "Reads the contents of a file",
  schema: z.object({
    fileName: z.string(),
  }),
});

/**
 * Tool: Write content to a file (overwrite or append).
 */
const writeFiles = tool(writeFile, {
  name: "write_file",
  description: "Writes text data to a file",
  schema: z.object({
    fileName: z.string(),
    data: z.string(),
  }),
});

/**
 * Tool: Search for a file by name within the project directory (recursive).
 */
const searchFile = tool(findFile, {
  name: "find_file",
  description: "Recursively searches for a file by name within the project folder",
  schema: z.object({
    fileName: z.string(),
  }),
});


// Export all tools as an array for LangGraph or planner consumption
export const fileTools = [
  makeFolder,
  cliCommand,
  makeFiles,
  readFiles,
  writeFiles,
  searchFile,
];

// Named tool map (used by LangGraph executors, routers, or fallback logic)
export const toolsByName = Object.fromEntries(
  fileTools.map((tool) => [tool.name, tool])
);

// Bind all tools to the LLM so it can call them autonomously
export const llmWithFileTools = llm.bindTools(fileTools);
