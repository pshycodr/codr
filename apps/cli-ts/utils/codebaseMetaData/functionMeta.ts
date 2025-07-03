import {
  Project,
  SyntaxKind,
  FunctionDeclaration,
  VariableDeclaration,
  ArrowFunction,
  SourceFile,
  Node,
  Identifier,
  CallExpression,
  ImportDeclaration,
  VariableStatement,
} from 'ts-morph';
import fs from 'fs';
import path from 'path';

interface FunctionMeta {
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

// ✅ ENABLE JSX/TSX parsing
const project = new Project({
  compilerOptions: {
    allowJs: true,
    jsx: 2, // React
    target: 2,
    module: 1,
    checkJs: false,
  },
});

project.addSourceFilesAtPaths([
  'src/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  '!**/node_modules/**/*',
  '!**/dist/**/*',
  '!**/build/**/*',
  '!**/out/**/*',
  '!**/.next/**/*',
  '!**/.vercel/**/*',
  '!**/.vscode/**/*',
  '!**/.idea/**/*',
  '!**/.github/**/*',
  '!**/coverage/**/*',
]);

function extractFunctionMeta(sourceFile: SourceFile): FunctionMeta[] {
  const results: FunctionMeta[] = [];

  sourceFile.getFunctions().forEach(fn => {
    const meta = buildFunctionMeta(fn.getName() || '<anonymous>', fn, sourceFile);
    results.push(meta);
  });

  sourceFile.getVariableDeclarations().forEach(decl => {
    const initializer = decl.getInitializer();
    if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
      const arrowFn = initializer as ArrowFunction;
      const name = decl.getName();
      const meta = buildFunctionMeta(name, arrowFn, sourceFile, true);
      results.push(meta);
    }
  });

  return results;
}

function isExportedNode(node: Node): boolean {
  if (Node.isModifierable(node)) {
    return node.getModifiers().some(mod => mod.getKind() === SyntaxKind.ExportKeyword);
  }
  return false;
}

function buildFunctionMeta(
  name: string,
  node: FunctionDeclaration | ArrowFunction,
  sourceFile: SourceFile,
  isArrowFunction: boolean = false
): FunctionMeta {
  const signature = node.getSignature?.();
  const body = node.getBody?.();

  const calls = new Set<string>();
  const variablesRead = new Set<string>();
  const variablesWritten = new Set<string>();

  if (body) {
    body.forEachDescendant(desc => {
      if (Node.isCallExpression(desc)) {
        const expr = desc.getExpression();
        if (Node.isIdentifier(expr)) {
          calls.add(expr.getText());
        }
      } else if (Node.isIdentifier(desc)) {
        const parent = desc.getParent();
        if (Node.isVariableDeclaration(parent) || Node.isBinaryExpression(parent)) {
          variablesWritten.add(desc.getText());
        } else {
          variablesRead.add(desc.getText());
        }
      }
    });
  }

  const importedIdentifiers = new Set<string>();
  sourceFile.getImportDeclarations().forEach(imp => {
    imp.getNamedImports().forEach(named => {
      importedIdentifiers.add(named.getName());
    });
  });

  const importsUsed = [...variablesRead].filter(name => importedIdentifiers.has(name));

  return {
    name,
    filePath: sourceFile.getFilePath(),
    startLine: node.getStartLineNumber?.() || 0,
    endLine: node.getEndLineNumber?.() || 0,
    isExported: isExportedNode(node),
    isAsync: node.isAsync?.() || false,
    isArrowFunction,
    parameters: node.getParameters().map(param => ({
      name: param.getName(),
      type: param.getType().getText() || 'any',
      isOptional: param.isOptional?.() || false,
      defaultValue: param.getInitializer()?.getText(),
    })),
    returnType: signature?.getReturnType().getText() || 'void',
    docstring: node.getJsDocs().map(doc => doc.getComment()).filter(Boolean).join('\n'),
    description: node.getJsDocs().map(doc => doc.getDescription()).filter(Boolean).join('\n'),
    calls: [...calls],
    importsUsed,
    variablesRead: [...variablesRead],
    variablesWritten: [...variablesWritten]
  };
}

function writeMetadataToFile(metadata: FunctionMeta[], outputPath: string) {
  const resolved = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`✅ Metadata written to ${resolved}`);
}

function generateFunctionMetadata() {
  const files = project.getSourceFiles().filter(file => {
    const filePath = file.getFilePath();
    return ![
      'node_modules', 'dist', 'build', 'out', '.git',
      '.next', '.vercel', '.github', '.vscode', '.idea', 'coverage'
    ].some(excluded => filePath.includes(path.sep + excluded + path.sep));
  });

  const allMetadata: FunctionMeta[] = [];

  for (const file of files) {
    const metas = extractFunctionMeta(file);
    allMetadata.push(...metas);
  }

  writeMetadataToFile(allMetadata, './.metadata/functions.json');
}

export default generateFunctionMetadata;
