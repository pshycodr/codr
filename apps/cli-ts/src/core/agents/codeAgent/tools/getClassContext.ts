import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import chalk from "chalk";
import fs from "fs";
import path from "path";

interface ClassMeta {
	name: string;
	filePath: string;
	startLine: number;
	endLine: number;
	accessModifier?: "public" | "private" | "protected";
	extends?: string;
	implements?: string[];
	properties: {
		name: string;
		type?: string;
		accessModifier?: "public" | "private" | "protected";
		defaultValue?: string;
	}[];
	methods: {
		name: string;
		startLine: number;
		endLine: number;
		isStatic?: boolean;
		accessModifier?: "public" | "private" | "protected";
	}[];
	docstring?: string;
}

interface ClassContext {
	metadata: ClassMeta;
	code: string;
	filePath: string;
}

export function getClassContext({
	className,
}: {
	className: string;
}): ClassContext | null {
	startLoader(`Getting class context for ${className}`);

	const classesMetaPath = path.resolve("./.codr/metadata/classes.json");

	if (!fs.existsSync(classesMetaPath)) {
		stopLoader(chalk.red("❌ classes.json not found in .metadata."));
		return null;
	}

	const raw = fs.readFileSync(classesMetaPath, "utf-8");
	const parsed: ClassMeta[] = JSON.parse(raw);

	const clsMeta = parsed.find((cls) => cls.name === className);

	if (!clsMeta) {
		stopLoader(chalk.yellow(`⚠️ Class '${className}' not found in metadata.`));
		return null;
	}

	if (!fs.existsSync(clsMeta.filePath)) {
		stopLoader(chalk.red(`❌ Source file not found: ${clsMeta.filePath}`));
		return null;
	}

	const fileLines = fs.readFileSync(clsMeta.filePath, "utf-8").split("\n");
	const code = fileLines
		.slice(clsMeta.startLine - 1, clsMeta.endLine)
		.join("\n");

	stopLoader(`Class context retrieval for ${className} completed.`);
	return {
		metadata: clsMeta,
		code,
		filePath: clsMeta.filePath,
	};
}

// Example usage:
// const result = getClassContext("SessionManager");
// console.log(result);
