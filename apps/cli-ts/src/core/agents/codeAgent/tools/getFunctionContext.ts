import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

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

  console.log(chalk.bgYellow.black("codeAgent/getFunctionContext Called"), fnName)


  const functionsMetaPath = path.resolve('.metadata/functions.json');

  if (!fs.existsSync(functionsMetaPath)) {
    console.log(chalk.red("❌ functions.json not found in .metadata."));
    return null;
  }

  const raw = fs.readFileSync(functionsMetaPath, 'utf-8');
  const parsed: FunctionMeta[] = JSON.parse(raw);

  const fnMeta = parsed.find(f => f.name === fnName);

  if (!fnMeta) {
    console.log(chalk.yellow(`⚠️ Function '${fnName}' not found in metadata.`));
    return null;
  }

  if (!fs.existsSync(fnMeta.filePath)) {
    console.log(chalk.red(`❌ Source file not found: ${fnMeta.filePath}`));
    return null;
  }

  const fileLines = fs.readFileSync(fnMeta.filePath, 'utf-8').split('\n');
  const code = fileLines.slice(fnMeta.startLine - 1, fnMeta.endLine).join('\n');

  return {
    metadata: fnMeta,
    code,
    filePath: fnMeta.filePath,
  };
}

// Example usage:
// const result = getFunctionContext("parseCodebase");
// console.log(result);
