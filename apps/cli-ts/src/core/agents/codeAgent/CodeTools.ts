import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { llm } from "@llm/gemini";

import { deleteCodeAtLines } from "./tools/deleteCode";
import { editFileAtLine } from "./tools/editCode";
import { getContext } from "./tools/getContext";
import {getCallGraphContext} from "./tools/getCallGraphContext";
import { getCodeContextByQuery } from "./tools/getContextByQuery";
import { getFunctionContext } from "./tools/getFunctionContext";
import { getClassContext } from "./tools/getClassContext";
import { getFileContext } from "./tools/getFileContext";
import generateCodebaseMetadata from "./tools/generateCodebaseMetadata";


const deleteCodeTool = tool(deleteCodeAtLines, {
  name: "delete_code",
  description: "Deletes a block of code from a file based on file path and start/end line numbers. Useful for removing functions, classes, or any code snippet.",
  schema: z.object({
    filePath: z.string(),
    startLine: z.number(),
    endLine: z.number()
  })
});

const editCodeTool = tool(editFileAtLine, {
  name: "edit_code",
  description: "Inserts code into a file at a specific line number. Useful for modifying or appending code to a file.",
  schema: z.object({
    filePath: z.string(),
    startLine: z.number(),
    content: z.string()
  })
});

const getContextTool = tool(getContext, {
  name: "get_context",
  description: "Retrieves metadata for a function, class, or file. Provides details like file path, start/end lines, parameters, return types, etc.",
  schema: z.object({
    name: z.string(),
    type: z.enum(["function", "class", "file"]).optional()
  })
});

const getCallGraphTool = tool(getCallGraphContext, {
  name: "get_call_graph",
  description: "Returns the call graph of a given function including functions it calls and those that call it.",
  schema: z.object({
    name: z.string()
  })
});

const getContextByQueryTool = tool(getCodeContextByQuery, {
  name: "get_context_by_query",
  description: "Searches the codebase context metadata using fuzzy or semantic matching based on the query.",
  schema: z.object({
    query: z.string()
  })
});

const getFunctionContextTool = tool(getFunctionContext, {
  name: "get_function_context",
  description: "Fetches metadata specifically for a function by name from the static metadata store.",
  schema: z.object({
    name: z.string()
  })
});

const getClassContextTool = tool(getClassContext, {
  name: "get_class_context",
  description: "Fetches metadata specifically for a class by name from the static metadata store.",
  schema: z.object({
    name: z.string()
  })
});

const getFileContextTool = tool(getFileContext, {
  name: "get_file_context",
  description: "Fetches metadata for a file including file path, language, number of lines, imports, exports, and defined functions/classes.",
  schema: z.object({
    filePath: z.string()
  })
});

const generateCodebaseMetadataTool = tool(generateCodebaseMetadata, {
  name: "generate_codebase_metadata",
  description: "Parses the full codebase to extract metadata of all functions, classes, files, and call graph. Stores results in .metadata folder and vector database.",
  schema: z.object({})
});

export const codeTools = [
  deleteCodeTool,
  editCodeTool,
  getContextTool,
  getCallGraphTool,
  getContextByQueryTool,
  getFunctionContextTool,
  getClassContextTool,
  getFileContextTool,
  generateCodebaseMetadataTool
];

export const codeToolsByName = Object.fromEntries(codeTools.map(t => [t.name, t]));
export const llmWithCodeTools = llm.bindTools(codeTools);
