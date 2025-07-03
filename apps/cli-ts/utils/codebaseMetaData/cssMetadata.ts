import fs from "fs";
import path from "path";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import { scanFilesByExtension } from "@utils/fileScanner";

interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

interface CssFileMetadata {
  rules: CssRule[];
  atRules?: string[];
}

function parseCssFile(filePath: string): CssFileMetadata {
  const css = fs.readFileSync(filePath, "utf-8");
  const root = postcss().process(css, { parser: safeParser }).root;

  const rules: CssRule[] = [];
  const atRules: string[] = [];

  root.walk(node => {
    if (node.type === "rule") {
      const declarations: Record<string, string> = {};
      node.walkDecls(decl => {
        declarations[decl.prop] = decl.value;
      });
      rules.push({
        selector: node.selector,
        declarations,
      });
    } else if (node.type === "atrule") {
      atRules.push(`@${node.name} ${node.params}`);
    }
  });

  return { rules, ...(atRules.length ? { atRules } : {}) };
}

export function generateCssMetadata() {
  const cssFiles = scanFilesByExtension(["css", "scss"]);
  const results: Record<string, CssFileMetadata> = {};

  for (const file of cssFiles) {
    results[file] = parseCssFile(file);
  }

  const outPath = path.resolve(".metadata/css.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`✅ CSS metadata written to ${outPath}`);
}
