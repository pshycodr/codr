import { RagClient } from "@transport/zeromqClient";
import { formatContextForLLM } from "@utils/formatContext";
import chalk from "chalk";

interface RagQueryInput {
  path: string;
  type: 'codebase';
  query: string;
}

interface CodeContextResult {
  code: string;
  filePath: string;
  metadata?: any;
  score?: number;
}

const rag = new RagClient();

export async function getCodeContextByQuery({query}:{query: string}){
  console.log(chalk.bgYellow.black("codeAgent/getCodeContextByQuery Called"), query)

  const cwd = process.cwd();
  const payload: RagQueryInput = {
    path: cwd,
    type: 'codebase',
    query,
  };

  try {
    const { success, response, error } = await rag.callRagOnce(payload);
    // console.log(response);
    
    const formattedContext = formatContextForLLM(response.results, 'codebase');

    if (!success) {
      console.log(chalk.red("❌ RAG query failed."), error);
      return `this is the ERROR : ${error}, \n And this is parameter you passes while calling the tool: ${query}. this tool only accepts Query in a pure string format not in any other format`;
    }

    return formattedContext|| [];
  } catch (err) {
    console.log(chalk.red("❌ Error during RAG query:"), err);
    return null;
  }
}

// Example usage:
// const result = await getCodeContextByQuery("How is the project indexed?");
// console.log(result);