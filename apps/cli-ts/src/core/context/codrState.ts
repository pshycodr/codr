import fs from 'fs/promises';
import path from 'path';

export interface CodrState {
  userGoal: string;
  currentInstructions: string[];
  filesCreated: Record<string, string>; // filePath -> latest content
  editsHistory: EditLog[];
  metadata: {
    functions: FunctionMeta[];
    classes: ClassMeta[];
    callgraph: CallGraphEdge[];
    files: FileMeta[];
    html?: Record<string, HtmlNode[]>; // filePath -> nodes
    css?: Record<string, CssFileMetadata>; // filePath -> rules
  };
  ragChunks: RagChunk[];
  markdownContexts: Record<string, string>; // .md filename -> content
  flags: {
    skipAST?: boolean;
    fallbackToRAG?: boolean;
  };
}

export interface EditLog {
  filePath: string;
  summary: string;
  timestamp: string;
}

export interface RagChunk {
  id: string;
  filePath: string;
  content: string;
  embedding?: number[];
}

// === Your Detailed Types ===

export interface FunctionMeta {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  isExported?: boolean;
  isAsync?: boolean;
  isArrowFunction?: boolean;
  parameters: {
    name: string;
    type?: string;
    isOptional?: boolean;
    defaultValue?: string;
  }[];
  returnType?: string;
  docstring?: string;
  description?: string;
  calls?: string[];
  importsUsed?: string[];
  variablesRead?: string[];
  variablesWritten?: string[];
}

export interface ClassMeta {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  extends?: string;
  implements?: string[];
  properties: {
    name: string;
    type?: string;
    accessModifier?: 'public' | 'private' | 'protected';
    defaultValue?: string;
  }[];
  methods: {
    name: string;
    startLine: number;
    endLine: number;
    isStatic?: boolean;
    accessModifier?: 'public' | 'private' | 'protected';
  }[];
  docstring?: string;
}

export interface FileMeta {
  filePath: string;
  language: string;
  fileSize?: number;
  numLines?: number;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  dependencies?: string[];
}

export interface CallGraphEdge {
  caller: string;
  callee: string;
  filePath: string;
  line: number;
}

export interface HtmlNode {
  tag: string;
  attributes: Record<string, string | undefined>;
  children?: HtmlNode[];
}

export interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

export interface CssFileMetadata {
  rules: CssRule[];
  atRules?: string[];
}

// === State Functions ===

const METADATA_PATH = '.metadata';
const CONTEXT_PATH = '.codr/contexts';

export async function loadCodrState(userGoal: string): Promise<CodrState> {
  const state: CodrState = {
    userGoal,
    currentInstructions: [],
    filesCreated: {},
    editsHistory: [],
    metadata: {
      functions: await loadJsonSafe<FunctionMeta[]>('functions.json'),
      classes: await loadJsonSafe<ClassMeta[]>('classes.json'),
      callgraph: await loadJsonSafe<CallGraphEdge[]>('callgraph.json'),
      files: await loadJsonSafe<FileMeta[]>('files.json'),
      html: await loadJsonSafe<Record<string, HtmlNode[]>>('html_metadata.json'),
      css: await loadJsonSafe<Record<string, CssFileMetadata>>('css_metadata.json'),
    },
    ragChunks: await loadJsonSafe<RagChunk[]>('rag_chunks.json'),
    markdownContexts: await loadMarkdownContexts(),
    flags: {},
  };

  return state;
}

export async function updateCodrStateFile(
  state: CodrState,
  filePath: string,
  content: string,
  summary = 'Updated file content'
) {
  state.filesCreated[filePath] = content;
  state.editsHistory.push({
    filePath,
    summary,
    timestamp: new Date().toISOString(),
  });
}

// Helper to safely read JSON files
async function loadJsonSafe<T>(file: string): Promise<T> {
  try {
    const filePath = path.join(METADATA_PATH, file);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [] as unknown as T;
  }
}

// Load all `.md` context files
async function loadMarkdownContexts(): Promise<Record<string, string>> {
  try {
    const files = await fs.readdir(CONTEXT_PATH);
    const result: Record<string, string> = {};
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(CONTEXT_PATH, file), 'utf-8');
        result[file] = content;
      }
    }
    return result;
  } catch {
    return {};
  }
}
