import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";

const findFile = async ({ fileName }: { fileName: string }) => {
	const root = process.cwd(); // Project root
	const result: string[] = [];

	startLoader(`Searching for file : ${fileName}`);

	async function searchDirectory(currentPath: string) {
		const entries = await fs.readdir(currentPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentPath, entry.name);

			if (entry.isDirectory()) {
				if (entry.name === "node_modules" || entry.name.startsWith("."))
					continue; // skip trash
				await searchDirectory(fullPath); // recursive
			} else if (entry.name === fileName) {
				console.log(chalk.yellow.black("File Path: ", fullPath));
				result.push(path.relative(root, fullPath)); // return relative path
			}
		}
	}

	try {
		await searchDirectory(root);

		if (result.length === 0) {
			return {
				success: false,
				message: `❌ File "${fileName}" not found in project.`,
			};
		}
		stopLoader(
			`✓ File found at: ${result.map((path) => `${path}`).join("\n")}`,
		);
		return {
			success: true,
			matches: result, // may be multiple
		};
	} catch (err: any) {
		return {
			success: false,
			error: `💥 Failed to search: ${err.message}`,
		};
	}
};

export default findFile;
