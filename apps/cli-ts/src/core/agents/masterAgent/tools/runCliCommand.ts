import chalk from "chalk";
import { spawn } from "child_process";
import inquirer from "inquirer";
import os from "os";
import readline from "readline";

type RunCommandResult =
	| { success: true; stdout: string; output: string }
	| { success: false; error: string; output?: string }
	| { success: false; userComment: string };

const DANGEROUS_COMMAND_PATTERNS = [
	/\brm\s+-rf\b/,
	/\bsudo\b/,
	/\bshutdown\b/,
	/\breboot\b/,
	/\bmkfs\b/,
	/\bdd\s+/,
	/\b:(){:|:&};:\b/,
	/\bkill\s+-9\b/,
	/\binit\b/,
];

const isDangerous = (command: string): boolean => {
	return DANGEROUS_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
};

function detectShell(): string {
	const shell = process.env.SHELL || process.env.ComSpec || "";
	if (/powershell/i.test(shell)) return "PowerShell";
	if (/bash/i.test(shell)) return "Git Bash";
	if (/cmd\.exe/i.test(shell)) return "Command Prompt";
	return "Unknown Shell";
}

const runCliCommand = async ({
	command,
}: {
	command: string;
}): Promise<RunCommandResult> => {
	console.log(chalk.bgGreen.black("⚙️  runCommand called"));
	console.log(chalk.cyan("🔹 Command Received:"), chalk.yellow(command));

	const shell = detectShell();
	console.log(chalk.magentaBright(`Detected Shell:`), chalk.white(shell));

	if (isDangerous(command)) {
		console.log(
			chalk.bgRed.white("⚠️  Warning: This command may be dangerous."),
		);
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
				message: chalk.cyan(
					"🗒 Enter your instruction/comment instead of executing:",
				),
			},
		]);
		console.log(chalk.bgYellow.black("📝 Comment Received:"), userComment);
		return { success: false, userComment };
	}

	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		let output = "";

		const child = spawn(command, {
			shell: true,
			stdio: ["pipe", "pipe", "pipe"],
		});

		// Capture stdout
		child.stdout?.on("data", (data) => {
			const dataStr = data.toString();
			process.stdout.write(dataStr);
			output += dataStr;
		});

		// Capture stderr
		child.stderr?.on("data", (data) => {
			const dataStr = data.toString();
			process.stderr.write(dataStr);
			output += dataStr;
		});

		// Handle user input
		rl.on("line", (input) => {
			child.stdin?.write(input + "\n");
		});

		child.on("exit", (code) => {
			rl.close();
			if (code === 0) {
				resolve({
					success: true,
					stdout: `Command "${command}" completed successfully.`,
					output: output.trim(), // Return the captured output
				});
			} else {
				resolve({
					success: false,
					error: `Command exited with code ${code}`,
					output: output.trim(), // Return the captured output even on error
				});
			}
		});

		child.on("error", (err) => {
			rl.close();
			resolve({
				success: false,
				error: err.message,
				output: output.trim(), // Return any partial output if available
			});
		});
	});
};

export default runCliCommand;
