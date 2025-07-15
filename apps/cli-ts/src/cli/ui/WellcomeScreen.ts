import chalk from "chalk";

export function printWelcomeScreen() {
  console.clear();

  const banner = `
      .-.                                   .-.      
     / \\_\\                                 /_/ \\     
    /  / /                                 \\ \\  \\     
   /  / /  ██████╗ ██████╗ ██████╗ ██████╗  \\ \\  \\    
  /  / /  ██╔════╝██╔═══██╗██╔══██╗██╔══██╗  \\ \\  \\   
 /  / /   ██║     ██║   ██║██║  ██║██████╔╝   \\ \\  \\  
'  <-<    ██║     ██║   ██║██║  ██║██╔══██╗    >->  ' 
 \\  \\ \\   ╚██████╗╚██████╔╝██████╔╝██║  ██║   / /  /  
  \\  \\ \\   ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝  / /  /   
   \\  \\_\\                                   /_/  /    
    \\ / /                                   \\ \\ /     
     '-'                                     \`-\`      
  `;

  const line = chalk.gray("────────────────────────────────────────────────────────────");

  console.log(chalk.cyanBright(banner));
  console.log(chalk.bold("          🧠 Codr CLI — Your AI Dev Sidekick"));
  console.log(chalk.dim("        Automate. Summarize. Build. Chat. Refactor.\n"));
  console.log(line);
  console.log();

  console.log("▶  Type " + chalk.yellow("codr --help") + " to explore available commands\n");

  console.log(chalk.bold("💡  What Codr Can Do:"));
  console.log("   " + chalk.green("✓") + " Answer code questions, debug, and refactor");
  console.log("   " + chalk.green("✓") + " Summarize and chat with PDFs, docs, and webpages");
  console.log("   " + chalk.green("✓") + " Analyze your local codebase (JS, TS, Python)");
  console.log("   " + chalk.green("✓") + " Create full-stack apps (backend to frontend)");
  console.log("   " + chalk.green("✓") + " Initialize Codr into any existing project");
  console.log();

  console.log(chalk.bold("🛠  Popular Commands:"));
  console.log("   " + chalk.cyan("codr") + "                " + chalk.gray("Chat mode for quick help and small tasks"));
  console.log("   " + chalk.cyan("codr create") + "        " + chalk.gray("Build a full-stack app from a single prompt"));
  console.log("   " + chalk.cyan("codr init") + "          " + chalk.gray("Generate project context from your codebase"));
  console.log("   " + chalk.cyan("codr doc") + "           " + chalk.gray("Query documents like PDFs or DOCX"));
  console.log("   " + chalk.cyan("codr webpage") + "       " + chalk.gray("Analyze local webpage HTML content"));
  console.log("   " + chalk.cyan("codr codebase") + "      " + chalk.gray("Ask questions over your local source code"));
  console.log();

  console.log(line);
}
