import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface FunctionMeta {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  [key: string]: any;
}

interface ClassMeta {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  [key: string]: any;
}

interface FileMeta {
  filePath: string;
  [key: string]: any;
}

export type ContextType = 'function' | 'class' | 'file';

export function getContext({entityName, type}:{entityName: string, type: ContextType}): FunctionMeta | ClassMeta | FileMeta | undefined {
  
  console.log(chalk.bgYellow.black("codeAgent/getContext Called"), entityName, type)

  const metadataDir = path.resolve(process.cwd(), '.metadata');

  if (!fs.existsSync(metadataDir)) {
    console.error('❌ .metadata folder not found');
    return undefined;
  }

  try {
    if (type === 'function') {
      const fnData: FunctionMeta[] = JSON.parse(fs.readFileSync(path.join(metadataDir, 'functions.json'), 'utf-8'));
      return fnData.find(fn => fn.name === entityName);
    }

    if (type === 'class') {
      const classData: ClassMeta[] = JSON.parse(fs.readFileSync(path.join(metadataDir, 'classes.json'), 'utf-8'));
      return classData.find(cls => cls.name === entityName);
    }

    if (type === 'file') {
      const fileData: FileMeta[] = JSON.parse(fs.readFileSync(path.join(metadataDir, 'files.json'), 'utf-8'));
      return fileData.find(f => f.filePath.includes(entityName));
    }

    return undefined;
  } catch (err) {
    console.error('❌ Failed to read context:', err);
    return undefined;
  }
}
