import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { llm } from "../llm/gemini"
import createFolder from "./createFolders"
import runCommand from "./runCommand"
import createFiles from "./createFiles"
import readFile from "./readFile"
import writeFile from "./writeFile"
import findFile from "./findFile"
import { makeToolCallingDecision } from "./makeToolCallingDecision"

const makeFolder = tool(
    createFolder,   
    {
        name : "create_folder",
        description : "Creates a new folder",
        schema : z.object({
            path: z.string()
        })
    }
)

const cliCommand = tool(
    runCommand, 
    {
        name : "run_cli-command",
        description : "run any commands in cli",
        schema : z.object({
            command: z.string()
        })
    }
)

const makeFiles = tool(
    createFiles,
    {
      name: 'make_files',
      description: 'Creates empty files in a specified folder',
      schema: z.object({
        folder: z.string(),
        files: z.array(z.string()),
      }),
    }
  );

const readFiles = tool(
    readFile,
    {
        name: "read_file",
        description: "Read Files content",
        schema : z.object({
            fileName : z.string()
        })
    }
)

const writeFiles = tool(
    writeFile,
    {
        name : "write_file",
        description: "Write on files",
        schema : z.object({
            fileName : z.string(),
            data : z.string()
        })
    }
)

const searchFile = tool(
    findFile,
    {
      name: "find_file",
      description: "Searches for a file by name inside the project folder recursively",
      schema: z.object({
        fileName: z.string(),
      }),
    }
  );


const toolCallingDecision = tool(
    makeToolCallingDecision,
    {
        name: "tool_calling_decision",
        description: "takes the task given by user and makes Tool Calling Decision and Gives detaied instruction of what to do",
        schema : z.object({
            task : z.string()
        })
    }
)

export const tools = [toolCallingDecision, makeFolder, cliCommand, makeFiles, readFiles, writeFiles, searchFile]
export const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
export const llmWithTools = llm.bindTools(tools)