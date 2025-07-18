import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { startLoader, stopLoader } from '@cli/ui/Loader/loaderManager';

interface FunctionMeta {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  isExported: boolean;
  isAsync: boolean;
  isArrowFunction: boolean;
  parameters: {
    name: string;
    type?: string;
    isOptional?: boolean;
  }[];
  returnType?: string;
  docstring?: string;
  description?: string;
  calls?: string[];
  importsUsed?: string[];
  variablesRead?: string[];
  variablesWritten?: string[];
}

interface FunctionContext {
  metadata: FunctionMeta;
  code: string;
  filePath: string;
}

export function getFunctionContext({fnName}:{fnName: string}): FunctionContext | null {

  startLoader(chalk.bgYellow.black("codeAgent/getFunctionContext Called: ") + fnName);

  const functionsMetaPath = path.resolve('./.codr/metadata/functions.json');

  if (!fs.existsSync(functionsMetaPath)) {
    stopLoader(chalk.red("❌ functions.json not found in .metadata."));
    return null;
  }

  const raw = fs.readFileSync(functionsMetaPath, 'utf-8');
  const parsed: FunctionMeta[] = JSON.parse(raw);

  const fnMeta = parsed.find(f => f.name === fnName);

  if (!fnMeta) {
    stopLoader(chalk.yellow(`⚠️ Function '${fnName}' not found in metadata.`));
    return null;
  }

  if (!fs.existsSync(fnMeta.filePath)) {
    stopLoader(chalk.red(`❌ Source file not found: ${fnMeta.filePath}`));
    return null;
  }

  const fileLines = fs.readFileSync(fnMeta.filePath, 'utf-8').split('\n');
  const code = fileLines.slice(fnMeta.startLine - 1, fnMeta.endLine).join('\n');

  stopLoader(`Function context retrieval completed for: ${fnName}`);
  return {
    metadata: fnMeta,
    code,
    filePath: fnMeta.filePath,
  };
}

// Example usage:
// const result = getFunctionContext("parseCodebase");
// startLoader("Displaying function context result"); stopLoader(`Function context retrieval completed for parseCodebase: ${result ? 'Success' : 'Failed'}`);
