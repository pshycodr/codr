import { Project } from "ts-morph";
import fs from "fs";
import path from "path";
import type { CodeEntity } from "../shared/types/codeEntity.types";
import { extractFunctions } from "./functionParser";
import { extractClasses } from "./classParser";

export function extractCodeEntities(filePath: string): CodeEntity[] {
  const ext = path.extname(filePath);
  
  if (![".ts", ".js"].includes(ext)) return [];

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const fileLines = fileContent.split("\n");

  const project = new Project({
    compilerOptions: { allowJs: true },
    useInMemoryFileSystem: false,
  });

  const sourceFile = project.createSourceFile("temp" + ext, fileContent, { overwrite: true });

  const results: CodeEntity[] = [];

  sourceFile.forEachDescendant((node) => {
    results.push(...extractFunctions(node, fileLines, filePath));
    results.push(...extractClasses(node, fileLines, filePath));
  });

  return results;
}
