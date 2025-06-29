import { SyntaxKind, Node } from "ts-morph";
import type { CodeEntity } from "../shared/types/codeEntity.types";
import { getCodeFromLines } from "../utils/helper";

export function extractClasses(node: Node, lines: string[], filePath: string): CodeEntity[] {
  const results: CodeEntity[] = [];

  if (node.getKind() === SyntaxKind.ClassDeclaration) {
    const cls = node.asKindOrThrow(SyntaxKind.ClassDeclaration);
    const name = cls.getName() || "<anonymous>";
    const start = cls.getStartLineNumber();
    const end = cls.getEndLineNumber();

    results.push({
      entity_name: name,
      entity_type: "class",
      start_line: start,
      end_line: end,
      code: getCodeFromLines(lines, start, end),
      file_path: filePath,
    });

    // Class methods
    cls.getMethods().forEach((method) => {
      const methodName = method.getName();
      const mStart = method.getStartLineNumber();
      const mEnd = method.getEndLineNumber();
      results.push({
        entity_name: methodName,
        entity_type: "method",
        start_line: mStart,
        end_line: mEnd,
        code: getCodeFromLines(lines, mStart, mEnd),
        file_path: filePath,
      });
    });
  }

  return results;
}
