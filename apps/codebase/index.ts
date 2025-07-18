import { spawn } from "bun";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extractCodeEntities as extractTSEntities } from "./src/ts/parser/extractCodeEntities";
import type { CodeEntity } from "./src/ts/shared/types/codeEntity.types";

export async function parseCodebase(folderPath: string): Promise<CodeEntity[]> {
	const results: CodeEntity[] = [];

	const ignoredDirs = [
		".vs",
		"node_modules",
		".venv",
		"__pycache__",
		".mypy_cache",
		"pyenv",
		"myenv",
		".git",
		"venv",
		"dist",
	];

	async function walk(dir: string) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		const promises: Promise<void>[] = []; // Store promises

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory() && ignoredDirs.includes(entry.name)) {
				continue;
			}

			if (entry.isDirectory()) {
				promises.push(walk(fullPath)); // Recursively call
			} else if (entry.isFile()) {
				// Create a promise for each file processing task
				const fileProcessingPromise = (async () => {
					const ext = path.extname(entry.name);
					if (
						ext === ".ts" ||
						ext === ".js" ||
						ext === ".jsx" ||
						ext === ".tsx"
					) {
						const tsResults = extractTSEntities(fullPath);
						results.push(...tsResults);
					} else if (ext === ".py") {
						const pyResults = await runPythonParser(fullPath);
						results.push(...pyResults);
					}
				})();
				promises.push(fileProcessingPromise);
			}
		}
		// Wait for all files and subdirectories in the current directory to be processed
		await Promise.all(promises);
	}

	await walk(folderPath);
	return results;
}

async function runPythonParser(filePath: string): Promise<CodeEntity[]> {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const pythonScriptPath = path.join(__dirname, "src/py/parser/run_parser.py");

	const process = spawn(["uv", "run", pythonScriptPath, filePath], {
		stdout: "pipe",
		stderr: "pipe",
	});

	const output = await new Response(process.stdout).text();
	const errorOutput = await new Response(process.stderr).text();

	if (errorOutput) {
		console.error(
			`❌ Error from Python parser for ${filePath}:\n${errorOutput}`,
		);
		return [];
	}

	try {
		return JSON.parse(output);
	} catch (err) {
		console.error(
			`❌ Failed to parse Python parser output for ${filePath}`,
			err,
		);
		console.error(`   Raw output was: "${output}"`);
		return [];
	}
}
