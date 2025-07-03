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

interface HtmlNode {
  tag: string;
  attributes: Record<string, string | undefined>;
  children?: HtmlNode[];
}

interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

export type ContextType = 'function' | 'class' | 'file' | 'html' | 'css';

interface ContextResult {
  success: boolean;
  message?: string;
  filePath?: string;
  data?: any;
}

export function getContext({
  entityName,
  type,
}: {
  entityName: string;
  type: ContextType;
}): ContextResult {
  console.log(chalk.bgYellow.black('🧠 codeAgent/getContext Called'), entityName, type);

  if (!entityName || !type) {
    return {
      success: false,
      message: '❌ Missing entityName or type parameter',
    };
  }

  const metadataDir = path.resolve(process.cwd(), '.metadata');
  if (!fs.existsSync(metadataDir)) {
    return {
      success: false,
      message: '❌ .metadata folder not found. Please generate metadata first.',
    };
  }

  try {
    const readJson = (file: string) => {
      const fullPath = path.join(metadataDir, file);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File ${file} not found in .metadata`);
      }
      return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    };

    if (type === 'function') {
      const fnData: FunctionMeta[] = readJson('functions.json');
      const found = fnData.find((fn) => fn.name === entityName);
      if (!found) {
        return { success: false, message: `🔍 Function "${entityName}" not found` };
      }
      return { success: true, filePath: found.filePath, data: found };
    }

    if (type === 'class') {
      const classData: ClassMeta[] = readJson('classes.json');
      const found = classData.find((cls) => cls.name === entityName);
      if (!found) {
        return { success: false, message: `🔍 Class "${entityName}" not found` };
      }
      return { success: true, filePath: found.filePath, data: found };
    }

    if (type === 'file') {
      const fileData: FileMeta[] = readJson('files.json');
      const found = fileData.find((f) => f.filePath.includes(entityName));
      if (!found) {
        return { success: false, message: `🔍 File containing "${entityName}" not found` };
      }
      return { success: true, filePath: found.filePath, data: found };
    }

    if (type === 'html') {
      const htmlData: Record<string, HtmlNode[]> = readJson('html.json');
      for (const [file, nodes] of Object.entries(htmlData)) {
        const found = findHtmlNodeByTag(nodes, entityName);
        if (found) {
          return { success: true, filePath: file, data: found };
        }
      }
      return { success: false, message: `🔍 HTML tag "${entityName}" not found` };
    }

    if (type === 'css') {
      const cssData: Record<string, { rules: CssRule[] }> = readJson('css.json');
      for (const [file, meta] of Object.entries(cssData)) {
        const rule = meta.rules.find((r) => r.selector === entityName);
        if (rule) {
          return { success: true, filePath: file, data: rule };
        }
      }
      return { success: false, message: `🔍 CSS selector "${entityName}" not found` };
    }

    return {
      success: false,
      message: `❌ Unsupported context type "${type}"`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `❌ Error while reading context: ${err.message}`,
    };
  }
}

function findHtmlNodeByTag(nodes: HtmlNode[], tag: string): HtmlNode | undefined {
  for (const node of nodes) {
    if (node.tag === tag) return node;
    if (node.children) {
      const found = findHtmlNodeByTag(node.children, tag);
      if (found) return found;
    }
  }
  return undefined;
}
