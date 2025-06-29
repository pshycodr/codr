export function getCodeFromLines(lines: string[], start: number, end: number): string {
    return lines.slice(start - 1, end).join("\n");
  }
  