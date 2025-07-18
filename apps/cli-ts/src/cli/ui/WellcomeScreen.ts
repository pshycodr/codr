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
  console.log(chalk.gray.bold("\n          🧠  Codr — Your AI Dev Sidekick"));
  console.log(chalk.dim("          Chat • Build • Debug • Automate\n"));

  const tips = [
    chalk.green("✓") + " Ask code questions or refactor snippets",
    chalk.green("✓") + " Summarize docs, webpages, or PDFs",
    chalk.green("✓") + " Create full-stack apps from a prompt",
  ];

  for (const tip of tips) {
    console.log("       " + tip);
  }

  console.log("\n" + line + "\n");
}
