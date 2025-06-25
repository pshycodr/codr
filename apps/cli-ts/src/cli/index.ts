import { program } from "commander";
import chalk from "chalk";


import { queryWebsite } from "../core/tools/documents/queryWebsite";
import { runLangGraphAgent } from "../core/agents/langgraphAgent";
import { chatWithContext } from "./commands/chat";
import { printWelcomeScreen } from "./ui/WellcomeScreen";
import { printHelpScreen } from "./ui/printHelpScreen";

program
  .name("codr")
  .description("AI CLI Assistant")
  .version("1.0.0");

// Show Welcome Screen if called with no args
if (process.argv.length <= 2) {
  printWelcomeScreen();
  process.exit(0);
}


// Handle -h manually
if (process.argv.includes("-h") || process.argv.includes("--help")) {
  printHelpScreen();
  process.exit(0);
}

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
      console.log(chalk.bgYellow.black("from webpage --chat"));
      await chatWithContext({ path: opts.url, query: opts.query, type: 'webpage' });
    } else {
      await queryWebsite({ path: opts.url, query: opts.query, type: 'webpage' });
    }
  });

program
  .command("doc")
  .description("Query a document (PDF, DOCX, TXT, CSV, MD) using RAG")
  .requiredOption("-p, --path <path>")
  .requiredOption("-q, --query <query>")
  .option("--chat", "Open persistent chat UI")
  .action(async (opts) => {
    if (opts.chat) {
      console.log(chalk.bgYellow.black("from doc --chat"));
      await chatWithContext({ path: opts.path, query: opts.query, type: 'doc' });
    } else {
      await queryWebsite({ path: opts.path, query: opts.query, type: 'doc' });
    }
  });

await program.parseAsync();
