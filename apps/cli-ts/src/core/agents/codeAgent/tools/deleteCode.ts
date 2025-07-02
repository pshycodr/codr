import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export function deleteCodeAtLines({filePath, startLine, endLine}:{filePath: string, startLine: number, endLine: number}): boolean {

  console.log(chalk.bgYellow.black("codeAgent/deleteCodeAtLines Called"), filePath, startLine, endLine)


    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }
  
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      const updated = [
        ...lines.slice(0, startLine - 1),
        ...lines.slice(endLine)
      ];
      fs.writeFileSync(filePath, updated.join('\n'), 'utf-8');
      console.log(`🗑️ Removed lines ${startLine}–${endLine} from ${filePath}`);
      return true;
    } catch (err) {
      console.error('❌ Failed to delete code from file:', err);
      return false;
    }
  } 
  