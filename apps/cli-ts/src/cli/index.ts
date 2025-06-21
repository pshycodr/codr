import { program } from "commander";

import { queryWebsite } from "../core/tools/documents/queryWebsite";
// import { readFile } from "../core/tools/file/readFile";
import { runLangGraphAgent } from "../core/agents/langgraphAgent";

program
  .name("codr")
  .description("AI CLI Assistant")
  .version("1.0.0");

// Natural LLM-powered fallback
program
  .argument("<prompt...>")
  .action(async (prompt) => {
    const msg = prompt.join(" ");
    await runLangGraphAgent(msg);
  });

program
  .command("rag")
  .description("Query a web page using RAG")
  .requiredOption("-u, --url <url>")
  .requiredOption("-q, --query <query>")
  .action(async (opts) => {
    await queryWebsite({ url: opts.url, query: opts.query });
  });

// program
//   .command("file")
//   .description("Run file operations")
//   .command("read <path>")
//   .action(async (path) => {
//     const content = await readFile(path);
//     console.log(content);
//   });

await program.parseAsync();
