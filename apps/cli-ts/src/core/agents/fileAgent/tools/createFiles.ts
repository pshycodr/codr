import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import fs from "fs/promises";
import path from "path";

type CreateFilesInput = {
	folder: string;
	files: string[];
};

const createFiles = async ({ folder, files }: CreateFilesInput) => {
	try {
		startLoader(
			`Creating files in :${folder} \n files: ${files.map((file) => `${file}`).join("\n")} `,
		);

		for (const file of files) {
			const filePath = path.join(folder, file);
			await fs.writeFile(filePath, "", { flag: "w" });
			console.log(`📝 Created: ${filePath}`);
		}

		stopLoader(`✓ Files Created Successfully`);

		return { success: true };
	} catch (error: any) {
		stopLoader(`❌ Error in createFiles: ${(error as Error).message}`);
		// throw err;
		return { success: false, error };
	}
};

export default createFiles;
