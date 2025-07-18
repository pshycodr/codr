import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import fs from "fs";

interface EditInstruction {
	content: string;
	filePath: string;
	startLine: number;
}

/**
 * Inserts or replaces code at the specified startLine in a file.
 * @param instruction content to insert, filePath, and startLine
 */
export function editFileAtLine({
	content,
	filePath,
	startLine,
}: EditInstruction): boolean {
	startLoader(`Inserting content at line ${startLine} in ${filePath} `);

	if (!fs.existsSync(filePath)) {
		stopLoader(`❌ File not found: ${filePath}`);
		return false;
	}

	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const lines = fileContent.split("\n");

		const updatedLines = [
			...lines.slice(0, startLine - 1),
			content,
			...lines.slice(startLine - 1),
		];

		fs.writeFileSync(filePath, updatedLines.join("\n"), "utf-8");
		stopLoader(`✅ Inserted content at line ${startLine} in ${filePath}`);
		return true;
	} catch (error) {
		stopLoader("❌ Failed to edit file.");
		return false;
	}
}

// Usage:
// editFileAtLine({
//   content: "console.log('hello')",
//   filePath: "./src/index.ts",
//   startLine: 10
// });
