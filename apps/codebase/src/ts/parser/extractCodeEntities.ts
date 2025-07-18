import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import type { CodeEntity } from "../shared/types/codeEntity.types";
import { extractClasses } from "./classParser";
import { extractFunctions } from "./functionParser";

// Initialize the Project only once (optional singleton)
const project = new Project({
	compilerOptions: {
		allowJs: true,
		jsx: 2, // 👈 Support for .tsx and .jsx
		target: 2, // ES6
		module: 1,
		checkJs: false, // CommonJS
	},
	useInMemoryFileSystem: false,
});

export function extractCodeEntities(filePath: string): CodeEntity[] {
	const ext = path.extname(filePath).toLowerCase();

	if (![".ts", ".js", ".jsx", ".tsx"].includes(ext)) return [];

	let fileContent: string;
	try {
		fileContent = fs.readFileSync(filePath, "utf-8");
	} catch (err) {
		console.warn(`⚠️ Failed to read file: ${filePath}`, err);
		return [];
	}

	const fileLines = fileContent.split("\n");

	// Use a temporary virtual file (avoids modifying real files)
	const sourceFile = project.createSourceFile("virtual" + ext, fileContent, {
		overwrite: true,
	});

	const results: CodeEntity[] = [];

	sourceFile.forEachDescendant((node) => {
		results.push(...extractFunctions(node, fileLines, filePath));
		results.push(...extractClasses(node, fileLines, filePath));
	});

	// Optionally remove the virtual file to avoid memory overhead
	project.removeSourceFile(sourceFile);

	return results;
}
