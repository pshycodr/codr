import chalk from 'chalk';
import fs from 'fs';
const writeFile = async ({ fileName, data }: { fileName: string, data: string }) => {
    try {
        // Remove or conditionally enable logging in production
        console.log(chalk.bgGreen.black("writeFile Called"));
        console.log("File Name: ", fileName);

        await fs.writeFile(fileName, data, "utf-8", (err) => {
            if (err) {
                console.error(`ERROR in \"writeFile\": ${err}`);
                return { success: false, error: err };
            } else {
                console.log(`File ${fileName} written successfully`);
                return { success: true };
            }
        });
        return { success: true };
    } catch (error) {
        console.error(`ERROR in \"writeFile\": ${error}`);
        return { success: false, error };
    }
};

export default writeFile