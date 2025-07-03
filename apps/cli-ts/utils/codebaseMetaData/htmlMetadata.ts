import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { scanFilesByExtension } from "@utils/fileScanner";

interface HtmlNode {
  tag: string;
  attributes: Record<string, string | undefined>;
  children?: HtmlNode[];
}

function parseHtmlFile(filePath: string): HtmlNode[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(content);

  function traverse(el: Element): HtmlNode {
    const $el = $(el);
    const tag = el.name;

    const attributes: Record<string, string | undefined> = {};
    const attrObj = $el.attr() || {};
    for (const [key, value] of Object.entries(attrObj)) {
      attributes[key] = value;
    }

    const children: HtmlNode[] = [];
    $el.children().each((_, child) => {
      if (child.type === "tag") {
        children.push(traverse(child as Element));
      }
    });

    return { tag, attributes, ...(children.length ? { children } : {}) };
  }

  const rootNodes: HtmlNode[] = [];
  $("html, body, head, main, div").each((_, el) => {
    if ((el as Element).parent?.type === "root") {
      rootNodes.push(traverse(el as Element));
    }
  });

  return rootNodes;
}

export function generateHtmlMetadata() {
  const htmlFiles = scanFilesByExtension(["html"]);
  const results: Record<string, HtmlNode[]> = {};

  for (const file of htmlFiles) {
    results[file] = parseHtmlFile(file);
  }

  const outPath = path.resolve(".metadata/html.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`✅ HTML metadata written to ${outPath}`);
}
