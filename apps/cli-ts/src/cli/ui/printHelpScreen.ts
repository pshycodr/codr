// utils/printHelpScreen.ts
import chalk from "chalk";

export function printHelpScreen() {
  const line = chalk.gray("────────────────────────────────────────────────────────────");

  console.log(line);
  console.log();
  console.log(chalk.bold.cyan("🧠  Codr CLI — AI Developer Assistant"));
  console.log(chalk.dim("Your terminal-native AI for code, docs, and web insights\n"));

  console.log(chalk.bold("Usage:"));
  console.log(`  ${chalk.green("codr <prompt...>")}               ${chalk.gray("Chat directly with Codr")}`);
  console.log(`  ${chalk.green("codr doc -p <path> -q <query>")}  ${chalk.gray("Query a document (PDF, DOCX, MD, etc)")}`);
  console.log(`  ${chalk.green("codr webpage -u <url> -q <query>")}  ${chalk.gray("Analyze and extract info from a webpage")}`);
  console.log();

  console.log(chalk.bold("Flags:"));
  console.log(`  ${chalk.yellow("-V, --version")}                  ${chalk.gray("Show current version")}`);
  console.log(`  ${chalk.yellow("-h, --help")}                     ${chalk.gray("Show this help screen")}`);
  console.log();

  console.log(chalk.bold("Examples:"));
  console.log(`  ${chalk.green("codr")} "how to write a binary search in Python"`);
  console.log(`  ${chalk.green("codr doc")} -p resume.pdf -q "Summarize my experience"`);
  console.log(`  ${chalk.green("codr webpage")} -u https://docs.python.org -q "What's new in 3.12?"`);
  console.log();
  console.log(line);
}
