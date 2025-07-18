import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import { resolvePath } from "@utils/resolvePath";
import * as fsSync from "fs";
import fs from "fs/promises";
import mammoth from "mammoth";
import path from "path";

const readFile = async ({ fileName }: { fileName: string }) => {
	const fullPath = resolvePath(fileName);
	const ext = path.extname(fullPath).toLowerCase();

	startLoader(`Reading file: ${fileName}`);

	try {
		let content = "";

		if (ext === ".docx") {
			const result = await mammoth.extractRawText({ path: fullPath });
			content = result.value;
		} else if (ext === ".pdf") {
			const dataBuffer = fsSync.readFileSync(fullPath); // must use sync for buffer

			// 👇 Lazy import avoids running test logic
			const { default: pdfParse } = await import("pdf-parse");

			const data = await pdfParse(dataBuffer);
			content = data.text;
		} else if (ext === ".md" || ext === ".txt") {
			content = await fs.readFile(fullPath, "utf8");
		} else {
			stopLoader(`⚠️ Unsupported file type: ${ext}`);
			return {
				success: false,
				error: `Unsupported file type: ${ext}. Supported types are .docx, .pdf, .md, and .txt.`,
			};
		}

		if (!content.trim()) {
			stopLoader(`⚠️ The file is empty`);
			return { success: true, content, warning: "File is empty" };
		}

		stopLoader(`✓ File read successfully`);
		return { success: true, content };
	} catch (error: any) {
		stopLoader(`❌ Failed to read: ${fileName}`);
		return {
			success: false,
			error: `Failed to read file. ${error.message}`,
		};
	}
};

export default readFile;
