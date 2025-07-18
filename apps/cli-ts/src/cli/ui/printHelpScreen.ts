// utils/printHelpScreen.ts
import chalk from "chalk";

export function printHelpScreen() {
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

	console.log(chalk.cyan(banner));

	const line = chalk.gray(
		"────────────────────────────────────────────────────────────",
	);

	console.log(line);
	console.log();
	console.log(chalk.bold.cyan("🧠  Codr CLI — AI Developer Assistant"));
	console.log(
		chalk.dim(
			"Terminal-native AI for coding, docs, web, and project building.\n",
		),
	);

	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.green("codr <prompt...>")}               ${chalk.gray("Chat with Codr for small quick tasks")}`,
	);
	console.log(
		`  ${chalk.green("codr create <goal>")}             ${chalk.gray("Create a full-stack project (backend → frontend)")}`,
	);
	console.log(
		`  ${chalk.green("codr init")}                       ${chalk.gray("Initialize Codr in an existing project for context-aware assistance")}`,
	);
	console.log(
		`  ${chalk.green("codr doc -p <path> -q <query>")}  ${chalk.gray("Query local documents (PDF, DOCX, MD, etc)")}`,
	);
	console.log(
		`  ${chalk.green("codr webpage -p <path> -q <query>")} ${chalk.gray("Analyze a downloaded webpage or scraped HTML")}`,
	);
	console.log(
		`  ${chalk.green("codr codebase -p <path> -q <query>")} ${chalk.gray("Ask questions about your local JS/TS/Python codebase")}`,
	);
	console.log();

	console.log(chalk.bold("Flags:"));
	console.log(
		`  ${chalk.yellow("-V, --version")}                  ${chalk.gray("Show current version")}`,
	);
	console.log(
		`  ${chalk.yellow("-h, --help")}                     ${chalk.gray("Show this help screen")}`,
	);
	console.log(
		`  ${chalk.yellow("--chat")}                          ${chalk.gray("Enable persistent chat UI for doc/web/codebase")}`,
	);
	console.log();

	console.log(chalk.bold("Examples:"));
	console.log(
		`  ${chalk.green("codr")} "what does this error mean in TypeScript?"`,
	);
	console.log(
		`  ${chalk.green("codr create")} "Build a blogging platform with MongoDB, Auth, Dark mode UI"`,
	);
	console.log(`  ${chalk.green("codr init")}`);
	console.log(
		`  ${chalk.green("codr doc")} -p resume.pdf -q "Summarize my experience"`,
	);
	console.log(
		`  ${chalk.green("codr webpage")} -p page.html -q "Extract key stats from this page"`,
	);
	console.log(
		`  ${chalk.green("codr codebase")} -p ./my-app -q "How is user authentication handled?"`,
	);
	console.log();
	console.log(line);
}
