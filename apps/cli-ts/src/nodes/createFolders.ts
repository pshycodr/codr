import chalk from 'chalk';
import { mkdir } from 'fs/promises';

const createFolder = async ({ path }: { path: string }) => {
  try {

    console.log(chalk.bgGreen.black("createFolder Called"))
    console.log("path: ", path);

    await mkdir(path, { recursive: true });
    console.log(`✅ Folder ensured at: ${path}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to create folder "${path}":`, error);
    return { success: false, error };
  }
};

export default createFolder;
