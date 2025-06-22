import { program } from "commander";

import { queryWebsite } from "../core/tools/documents/queryWebsite";
// import { readFile } from "../core/tools/file/readFile";
import { runLangGraphAgent } from "../core/agents/langgraphAgent";
import { startChatUI } from "./ui/chatUI";
import { chatWithContext } from "./commands/chat";
import chalk from "chalk";

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
  .command("webpage")
  .description("Query a web page using RAG")
  .requiredOption("-u, --url <url>")
  .requiredOption("-q, --query <query>")
  .option("--chat", "Open persistent chat UI")
  .action(async (opts) => {
    if (opts.chat) {
      console.log(chalk.bgYellow.black("from webpage --chat"))

      await chatWithContext({ path: opts.url, query: opts.query, type: 'webpage' })
    }else{
    await queryWebsite({ path: opts.url, query: opts.query, type: 'webpage' });
    }
  });

program
  .command("doc")
  .description("Query a documents(.pdf, .docx, .txt, .csv, .md ) using RAG")
  .requiredOption("-p, --path <path>")
  .requiredOption("-q, --query <query>")
  .option("--chat", "Open persistent chat UI")
  .action(async (opts) => {
    if (opts.chat) {
      console.log(chalk.bgYellow.black("from doc --chat"))

      await chatWithContext({ path: opts.path, query: opts.query, type: 'doc' })
    } else {
      await queryWebsite({ path: opts.path, query: opts.query, type: 'doc' });
    }
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
