import { parseCodebase } from "@codebase";
import callRAG, { RagClient } from "@transport/zeromqClient";
import generateCallGraph from "@utils/codebaseMetaData/callgraph";
import generateClassMetadata from "@utils/codebaseMetaData/classMetadata";
import generateFileMetadata from "@utils/codebaseMetaData/filesMetadata";
import generateFunctionMetadata from "@utils/codebaseMetaData/functionMeta";
import chalk from "chalk";
import fs from "fs";
import path from "path";

type CodeEntity = {
  entity_name: string;
  code: string;
  entity_type: string;
  file_path: string;
  start_line: number;
  end_line: number;
  description?: string;
};

interface QueryData {
  path: string;
  query: "none";
  parsedCodebase?: CodeEntity[];
  type: "codebase";
}

const metadataPath = path.resolve("./.metadata");
const rag = new RagClient();
const dirname = process.cwd();

const generateCodebaseMetadata = async () => {
  try {
    const { success, response } = await rag.callRagOnce({
      type: "check_collection",
      path: dirname,
    });

    if (fs.existsSync(metadataPath) && response.exists) {
      console.log(".metadata folder exists ✅");
      return "project .metadata folder already exists in the root folder and in the vector db";
    }

    if (!response.exists) {
      // Parse codebase
      console.log(chalk.cyan("🔍 Parsing and summarizing codebase..., path: "), dirname);
      const parsed = await parseCodebase(dirname);
      console.log(chalk.cyanBright("📄 Parsed:"), parsed?.length, "items");

      // Send to RAG
      console.log(chalk.yellowBright("📡 Sending to RAG..."));
      const data: QueryData = {
        path: dirname,
        parsedCodebase: parsed,
        type: "codebase",
        query: "none",
      };

      const { success: ragSuccess, response: context } = await callRAG(data);

      if (!ragSuccess) {
        console.log(chalk.redBright("❌ Failed to retrieve context from RAG."));
        return { success: false };
      }

      generateCallGraph();
      generateClassMetadata();
      generateFileMetadata();
      generateFunctionMetadata();
    }

    return "project .metadata folder and vector embeddings created successfully";
  } catch (error: any) {
    console.log(chalk.redBright("❌ Failed to generate metadata: "), error);
  }
};

export default generateCodebaseMetadata;
