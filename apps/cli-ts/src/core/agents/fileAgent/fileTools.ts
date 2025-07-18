import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { llm } from "@llm/llm";

// File operation handlers
import createFolder from "./tools/createFolders";
import createFiles from "./tools/createFiles";
import readFile from "./tools/readFile";
import writeFile from "./tools/writeFile";
import findFile from "./tools/findFile";

/**
 * Tool: Create a new folder at a specified path.
 */
const makeFolder = tool(createFolder, {
  name: "create_folder",
  description: "Creates a new directory at the given path, including any intermediate folders if necessary.",
  schema: z.object({
    path: z.string().describe("The absolute or relative folder path to be created (e.g., './src/components')"),
  }),
});

/**
 * Tool: Create one or more files inside a specified folder.
 */
const makeFiles = tool(createFiles, {
  name: "make_files",
  description: "Creates multiple empty files inside a given folder. Useful for scaffolding or bootstrapping file structures.",
  schema: z.object({
    folder: z.string().describe("The folder in which to create the files"),
    files: z.array(z.string()).describe("List of file names to create inside the folder (e.g., ['index.ts', 'utils.ts'])"),
  }),
});

/**
 * Tool: Read the contents of a supported file (.txt, .md, .pdf, .docx).
 */
const readFiles = tool(readFile, {
  name: "read_file",
  description: "Reads the content of a file. Supports plain text, markdown, PDF, and Word documents.",
  schema: z.object({
    fileName: z.string().describe("Path to the file to read, relative to the project root or absolute."),
  }),
});

/**
 * Tool: Write or overwrite text into a file.
 */
const writeFiles = tool(writeFile, {
  name: "write_file",
  description: "Writes text content into a file. If the file exists, it will be overwritten.",
  schema: z.object({
    fileName: z.string().describe("The file path where content should be written"),
    data: z.string().describe("The actual string content to write into the file"),
  }),
});

/**
 * Tool: Search for a file by name within the entire project directory.
 */
const searchFile = tool(findFile, {
  name: "find_file",
  description: "Searches for a file by name recursively from the project root directory. Useful when the exact path is unknown.",
  schema: z.object({
    fileName: z.string().describe("Name of the file to search for (e.g., 'app.tsx' or 'README.md')"),
  }),
});

// Export all tools as an array for LangGraph or planner usage
export const fileTools = [
  makeFolder,
  makeFiles,
  readFiles,
  writeFiles,
  searchFile,
];

// Named tool map (used by LangGraph, routers, or fallback logic)
export const toolsByName = Object.fromEntries(
  fileTools.map((tool) => [tool.name, tool])
);

// Bind to LLM for autonomous tool invocation
export const llmWithFileTools = llm.bindTools(fileTools);
