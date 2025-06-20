import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';


type CreateFilesInput = {
  folder: string;
  files: string[];
};

const createFiles = async ({ folder, files }: CreateFilesInput) => {
  try {

    console.log(chalk.bgGreen.black("createFile Called"))
    console.log("Folder and Files: ", folder, files);



    for (const file of files) {
      const filePath = path.join(folder, file);
      await fs.writeFile(filePath, '', { flag: 'w' });
      console.log(`📝 Created: ${filePath}`);
    }

    return { success: true, };
  } catch (error: any) {
    console.error(`❌ Error in createFiles: ${(error as Error).message}`);
    // throw err;
    return { success: false, error }
  }
};

export default createFiles;
