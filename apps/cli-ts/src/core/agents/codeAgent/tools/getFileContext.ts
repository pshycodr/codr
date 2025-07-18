import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import chalk from "chalk";
import fs from "fs";
import path from "path";

interface FileMeta {
	filePath: string;
	language: string;
	fileSize?: number;
	numLines?: number;
	imports: string[];
	exports: string[];
	functions: string[];
	classes: string[];
	dependencies?: string[];
}

interface FileContext {
	metadata: FileMeta;
	code: string;
}

export function getFileContext({
	filePath,
}: {
	filePath: string;
}): FileContext | null {
	startLoader(`Getting file context for: ${filePath}`);

	const filesMetaPath = path.resolve("./.codr/metadata/files.json");

	if (!fs.existsSync(filesMetaPath)) {
		stopLoader(chalk.red("❌ files.json not found in .metadata."));
		return null;
	}

	const raw = fs.readFileSync(filesMetaPath, "utf-8");
	const parsed: FileMeta[] = JSON.parse(raw);

	const fileMeta = parsed.find(
		(file) => path.resolve(file.filePath) === path.resolve(filePath),
	);

	if (!fileMeta) {
		stopLoader(chalk.yellow(`⚠️ File '${filePath}' not found in metadata.`));
		return null;
	}

	if (!fs.existsSync(fileMeta.filePath)) {
		stopLoader(chalk.red(`❌ Source file not found: ${fileMeta.filePath}`));
		return null;
	}

	const code = fs.readFileSync(fileMeta.filePath, "utf-8");

	stopLoader(`File context retrieval completed for: ${filePath}`);
	return {
		metadata: fileMeta,
		code,
	};
}

// Example usage:
// const result = getFileContext("./src/utils/logger.ts");
// console.log(result);
