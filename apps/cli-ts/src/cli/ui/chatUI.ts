// import chalk from "chalk";
// import ora from "ora";
// import readline from "readline";
// import { runLangGraphAgent } from "../../core/agents/langgraphAgent"; 

// export function startChatInterface() {
//   console.log(chalk.bold.green("\n💡 Welcome to Codr Chat Mode!\n"));

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     prompt: chalk.blueBright("You » "),
//   });

//   rl.prompt();

//   rl.on("line", async (input: string) => {
//     const spinner = ora("Thinking...").start();

//     try {
//       const response = await runLangGraphAgent(input);
//       spinner.stop();
//       if (response) printBotMessage(response);
//     } catch (err: any) {
//       spinner.fail("Something went wrong.");
//       console.error(chalk.redBright("❌ Error:"), err.message);
//     }

//     rl.prompt();
//   });

//   rl.on("SIGINT", () => {
//     console.log(chalk.cyanBright("\n👋 Exiting chat. Bye!\n"));
//     rl.close();
//     process.exit(0);
//   });
// }

// function printBotMessage(message: string) {
//   const lines = message.split("\n");
//   for (const line of lines) {
//     process.stdout.write(chalk.greenBright("Codr » "));
//     let i = 0;
//     const interval = setInterval(() => {
//       if (i < line.length) {
//         process.stdout.write(line[i]);
//         i++;
//       } else {
//         process.stdout.write("\n");
//         clearInterval(interval);
//       }
//     }, 10);
//   }
// }
