import chalk from 'chalk';
import fs from 'fs/promises';
import { resolvePath } from "@utils/resolvePath"
import { startLoader, stopLoader } from '@cli/ui/Loader/loaderManager';


const readFile = async ({ fileName }: { fileName: string }) => {
    startLoader(`Reading file: ${fileName}`)

    // Resolve relative path based on current working directory
    const fullPath = resolvePath(fileName)
    console.log("🔍 Resolved Path:", fullPath);

    try {
        const res = await fs.readFile(fullPath, "utf-8");

        if (!res.trim()) {
            console.log(chalk.yellow.black("⚠️ The file is empty."));
        }
        stopLoader(`✓ File read successfully`)
        return { success: true, content: res };
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.log(chalk.red.black(`❌ File not found: ${fileName}`));
        } else {
            console.log(chalk.red.black(`💥 Error reading file: ${error.message}`));
        }

        return { success: false, error: error.message };
    }
};

export default readFile;
