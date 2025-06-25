
import chalk from "chalk";

export function printWelcomeScreen() {
  console.clear();

  const banner = `


 ██████╗ ██████╗ ██████╗ ██████╗      ██████╗██╗     ██╗
██╔════╝██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██║     ██║
██║     ██║   ██║██║  ██║██████╔╝    ██║     ██║     ██║
██║     ██║   ██║██║  ██║██╔══██╗    ██║     ██║     ██║
╚██████╗╚██████╔╝██████╔╝██║  ██║    ╚██████╗███████╗██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝     ╚═════╝╚══════╝╚═╝
`;

  const line = chalk.gray("────────────────────────────────────────────────────────────");


  console.log(chalk.cyanBright(banner));
  console.log(chalk.bold("          🧠 Codr CLI — Your AI Dev Sidekick"));
  console.log(chalk.dim("        Automate. Summarize. Chat. Execute. Learn.\n"));
  console.log(line);
  console.log();
  console.log("▶  Type " + chalk.yellow("codr help") + " to explore available tools\n");

  console.log(chalk.bold("💡  Highlights:"));
  console.log("   " + chalk.green("✓") + " Summarize PDFs, code, docs");
  console.log("   " + chalk.green("✓") + " Query webpages with context");
  console.log("   " + chalk.green("✓") + " Persistent terminal chat with memory");
  console.log("   " + chalk.green("✓") + " LangGraph-powered decision-making");
  console.log();
  console.log(line);
}


