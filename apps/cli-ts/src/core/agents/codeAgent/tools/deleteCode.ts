import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import fs from "fs";

export function deleteCodeAtLines({
	filePath,
	startLine,
	endLine,
}: {
	filePath: string;
	startLine: number;
	endLine: number;
}): boolean {
	startLoader(
		`Deleting Code: \nfile: ${filePath} \nfrom: ${startLine} - ${endLine}`,
	);

	if (!fs.existsSync(filePath)) {
		stopLoader(`❌ File not found: ${filePath}`);
		return false;
	}

	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const lines = fileContent.split("\n");
		const updated = [...lines.slice(0, startLine - 1), ...lines.slice(endLine)];
		fs.writeFileSync(filePath, updated.join("\n"), "utf-8");
		stopLoader(`🗑️ Removed lines ${startLine}–${endLine} from ${filePath}`);
		return true;
	} catch (err) {
		stopLoader("❌ Failed to delete code from file");
		return false;
	}
}
