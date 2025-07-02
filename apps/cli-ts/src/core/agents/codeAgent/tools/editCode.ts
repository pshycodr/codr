import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface EditInstruction {
  content: string;
  filePath: string;
  startLine: number;
}

/**
 * Inserts or replaces code at the specified startLine in a file.
 * @param instruction content to insert, filePath, and startLine
 */
export function editFileAtLine(instruction: EditInstruction): boolean {

  console.log(chalk.bgYellow.black("codeAgent/editFileAtLine Called"), instruction)


  const { content, filePath, startLine } = instruction;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const updatedLines = [
      ...lines.slice(0, startLine - 1),
      content,
      ...lines.slice(startLine - 1)
    ];

    fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
    console.log(`✅ Inserted content at line ${startLine} in ${filePath}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to edit file:', error);
    return false;
  }
} 

// Usage:
// editFileAtLine({
//   content: "console.log('hello')",
//   filePath: "./src/index.ts",
//   startLine: 10
// });


