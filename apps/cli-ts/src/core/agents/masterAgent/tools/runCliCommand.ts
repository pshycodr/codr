import chalk from "chalk";
import { spawn } from "child_process";
import inquirer from "inquirer";

// Type returned from runCliCommand
type RunCommandResult =
	| { success: true; stdout: string; output: string }
	| { success: false; error: string; output?: string }
	| { success: false; userComment: string };

// Dangerous command patterns
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

const isDangerous = (command: string): boolean =>
	DANGEROUS_COMMAND_PATTERNS.some((pattern) => pattern.test(command));

// Simple shell detector
function detectShell(): string {
	const shell = process.env.SHELL || process.env.ComSpec || "";
	if (/powershell/i.test(shell)) return "PowerShell";
	if (/bash/i.test(shell)) return "Git Bash";
	if (/cmd\.exe/i.test(shell)) return "Command Prompt";
	return "Unknown Shell";
}

// Detect interactive command
function isInteractiveCommand(command: string): boolean {
	return ["shadcn", "create-", "init", "login", "auth", "add", "new"].some(
		(keyword) => command.includes(keyword),
	);
}

// Main runner
const runCliCommand = async ({
	command,
}: {
	command: string;
}): Promise<RunCommandResult> => {
	console.log(chalk.bgGreen.black("⚙️  runCommand called"));
	console.log(chalk.cyan("🔹 Command Received:"), chalk.yellow(command));

	const shell = detectShell();
	console.log(chalk.magentaBright("Detected Shell:"), chalk.white(shell));

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

	const interactive = isInteractiveCommand(command);

	return new Promise((resolve) => {
		if (interactive) {
			// 🔄 Full terminal control for interactive commands
			const child = spawn(command, {
				shell: true,
				stdio: "inherit",
			});

			child.on("exit", (code) => {
				if (code === 0) {
					resolve({
						success: true,
						stdout: `✅ Interactive command "${command}" completed successfully.`,
						output: `interactive command executed`,
					});
				} else {
					resolve({
						success: false,
						error: `❌ Interactive command exited with code ${code}`,
					});
				}
			});

			child.on("error", (err) => {
				resolve({
					success: false,
					error: `❌ Interactive command failed: ${err.message}`,
				});
			});
		} else {
			// 🧾 Output-capturing mode for non-interactive commands
			const child = spawn(command, {
				shell: true,
				stdio: ["pipe", "pipe", "pipe"],
			});

			let output = "";

			child.stdout?.on("data", (data) => {
				const str = data.toString();
				process.stdout.write(str);
				output += str;
			});

			child.stderr?.on("data", (data) => {
				const str = data.toString();
				process.stderr.write(str);
				output += str;
			});

			child.on("exit", (code) => {
				if (code === 0) {
					resolve({
						success: true,
						stdout: `✅ Command "${command}" completed successfully.`,
						output: output.trim(),
					});
				} else {
					resolve({
						success: false,
						error: `❌ Command exited with code ${code}`,
						output: output.trim(),
					});
				}
			});

			child.on("error", (err) => {
				resolve({
					success: false,
					error: `❌ Failed to execute command: ${err.message}`,
					output: output.trim(),
				});
			});
		}
	});
};

export default runCliCommand;
