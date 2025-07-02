import chalk from "chalk";
import inquirer from "inquirer";
import { exec } from "child_process";
import util from "util";
import os from "os";
import path from "path";

const execPromise = util.promisify(exec);

type RunCommandResult =
  | { success: true; stdout: string }
  | { success: false; error: string };

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
const escapeForBash = (cmd: string): string => {
  return cmd.replace(/"/g, '\\"');
};

const runCliCommand = async ({ command }: { command: string }): Promise<RunCommandResult> => {
  console.log(chalk.bgGreen.black("⚙️  runCommand called"));
  console.log(chalk.cyan("🔹 Command Received:"), chalk.yellow(command));

  if (isDangerous(command)) {
    console.log(chalk.bgRed.white("⚠️  Warning: This command may be dangerous."));
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.yellow("✔ Do you want to execute this command?"),
      default: false,
    },
  ]);

  if (!confirm) {
    const msg = "Execution aborted by user.";
    console.log(chalk.bgBlue.white("ℹ️  " + msg));
    return { success: false, error: msg };
  }

  const isWindows = os.platform() === "win32";

  try {
    const finalCommand = isWindows
      ? `bash -c "${escapeForBash(command)}"` // Use Git Bash
      : command;

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
