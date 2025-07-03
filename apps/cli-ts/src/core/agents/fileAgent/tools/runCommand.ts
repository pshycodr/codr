import chalk from "chalk";
import inquirer from "inquirer";
import { exec } from "child_process";
import util from "util";
import os from "os";
import path from "path";

const execPromise = util.promisify(exec);

type RunCommandResult =
  | { success: true; stdout: string }
  | { success: false; error: string }
  | { success: false; userComment: string };

const DANGEROUS_COMMAND_PATTERNS = [
  /\brm\s+-rf\b/,
  /\bsudo\b/,
  /\bshutdown\b/,
  /\breboot\b/,
  /\bmkfs\b/,
  /\bdd\s+/,
  /\b:(){:|:&};:\b/, // fork bomb
  /\bkill\s+-9\b/,
  /\binit\b/,
];

const isDangerous = (command: string): boolean => {
  return DANGEROUS_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
};

// Escape double quotes for bash -c
const escapeForBash = (cmd: string): string => cmd.replace(/"/g, '\\"');

function detectShell(): string {
  const shell = process.env.SHELL || process.env.ComSpec || "";
  if (/powershell/i.test(shell)) return "PowerShell";
  if (/bash/i.test(shell)) return "Git Bash";
  if (/cmd\.exe/i.test(shell)) return "Command Prompt";
  return "Unknown Shell";
}

const runCliCommand = async ({ command }: { command: string }): Promise<RunCommandResult> => {
  console.log(chalk.bgGreen.black("⚙️  runCommand called"));
  console.log(chalk.cyan("🔹 Command Received:"), chalk.yellow(command));

  const shell = detectShell();
  console.log(chalk.magentaBright(`💻 Detected Shell:`), chalk.white(shell));

  if (isDangerous(command)) {
    console.log(chalk.bgRed.white("⚠️  Warning: This command may be dangerous."));
  }

  const { decision } = await inquirer.prompt([
    {
      type: "list",
      name: "decision",
      message: chalk.yellow("✔ How do you want to proceed?"),
      choices: [
        { name: "✅ Yes, run the command", value: "yes" },
        { name: "❌ No, abort", value: "no" },
        { name: "📝 Enter a comment/instruction instead", value: "command" },
      ],
      default: "yes",
    },
  ]);

  if (decision === "no") {
    const msg = "Execution aborted by user.";
    console.log(chalk.bgBlue.white("ℹ️  " + msg));
    return { success: false, error: msg };
  }

  if (decision === "command") {
    const { userComment } = await inquirer.prompt([
      {
        type: "input",
        name: "userComment",
        message: chalk.cyan("🗒 Enter your instruction/comment instead of executing:"),
      },
    ]);
    console.log(chalk.bgYellow.black("📝 Comment Received:"), userComment);
    return { success: false, userComment };
  }

  const isWindows = os.platform() === "win32";
  const finalCommand = isWindows
    ? `bash -c "${escapeForBash(command)}"` // Use Git Bash if possible
    : command;

  try {
    const { stdout } = await execPromise(finalCommand);
    console.log(chalk.greenBright("✅ Command executed successfully.\n"));
    console.log(chalk.gray(stdout));
    return { success: true, stdout };
  } catch (error: any) {
    console.error(chalk.bgRed.white("❌ Error during command execution:"), error.message);
    return { success: false, error: error.message };
  }
};

export default runCliCommand;
