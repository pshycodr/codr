import { startLoader, stopLoader } from '@cli/ui/Loader/loaderManager';
import chalk from 'chalk';
import { mkdir } from 'fs/promises';

const createFolder = async ({ path }: { path: string }) => {
  try {

    startLoader(`Creating Folder at : ${path}`)

    await mkdir(path, { recursive: true });
    stopLoader('✓ Folder Created Successfully');
    return { success: true };
  } catch (error) {
    stopLoader(`❌ Failed to create folder "${path}"`);
    return { success: false, error };
  }
};

export default createFolder;
