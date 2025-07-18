import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Confirmation tool — lets user review & approve or modify the agent's plan.
 */
export async function confirmAction({ decision }: { decision: string }) {
	console.log(chalk.cyanBright("\n🤖 AI Decision:"));
	console.log(chalk.yellowBright(decision));

	const { userChoice } = await inquirer.prompt([
		{
			type: "list",
			name: "userChoice",
			message: chalk.greenBright("\n❓ Proceed with this action?"),
			choices: [
				{ name: "✅ Yes (continue)", value: "yes" },
				{ name: "❌ No (abort this step)", value: "no" },
				{ name: "✏️  Custom Input (edit or override)", value: "command" },
			],
			default: "yes",
		},
	]);

	if (userChoice === "command") {
		const { customInput } = await inquirer.prompt([
			{
				type: "input",
				name: "customInput",
				message: chalk.blue("💬 Enter your custom instruction:"),
			},
		]);
		return { confirmed: "command", customInput };
	}

	return { confirmed: userChoice };
}
