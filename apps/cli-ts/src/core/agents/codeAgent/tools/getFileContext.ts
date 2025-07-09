import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface FileMeta {
  filePath: string;
  language: string;
  fileSize?: number;
  numLines?: number;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  dependencies?: string[];
}

interface FileContext {
  metadata: FileMeta;
  code: string;
}

export function getFileContext({filePath}:{filePath: string}): FileContext | null {

  console.log(chalk.bgYellow.black("codeAgent/getFileContext Called"), filePath)


  const filesMetaPath = path.resolve('./.codr/metadata/files.json');

  if (!fs.existsSync(filesMetaPath)) {
    console.log(chalk.red("❌ files.json not found in .metadata."));
    return null;
  }

  const raw = fs.readFileSync(filesMetaPath, 'utf-8');
  const parsed: FileMeta[] = JSON.parse(raw);

  const fileMeta = parsed.find(file => path.resolve(file.filePath) === path.resolve(filePath));

  if (!fileMeta) {
    console.log(chalk.yellow(`⚠️ File '${filePath}' not found in metadata.`));
    return null;
  }

  if (!fs.existsSync(fileMeta.filePath)) {
    console.log(chalk.red(`❌ Source file not found: ${fileMeta.filePath}`));
    return null;
  }

  const code = fs.readFileSync(fileMeta.filePath, 'utf-8');

  return {
    metadata: fileMeta,
    code,
  };
}

// Example usage:
// const result = getFileContext("./src/utils/logger.ts");
// console.log(result);