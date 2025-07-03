import { Project, SyntaxKind, SourceFile } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { statSync } from 'fs';

export interface FileMeta {
  filePath: string;
  language: "ts" | "js" | "py" | "go" | "jsx" | "tsx" | string;
  fileSize?: number;
  numLines?: number;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  dependencies?: string[];
}

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

function getFileLanguage(filePath: string): string {
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  return ext;
}

function extractFileMeta(sourceFile: SourceFile): FileMeta {
  const filePath = sourceFile.getFilePath();
  const fileText = sourceFile.getFullText();
  const numLines = fileText.split(/\r?\n/).length;
  const fileSize = statSync(filePath).size;

  const imports: string[] = [];
  const exports: string[] = [];
  const functions: string[] = [];
  const classes: string[] = [];

  sourceFile.getImportDeclarations().forEach(imp => {
    imports.push(imp.getModuleSpecifierValue());
  });

  sourceFile.getExportedDeclarations().forEach((decls, name) => {
    exports.push(name);
  });

  sourceFile.getFunctions().forEach(fn => {
    const name = fn.getName();
    if (name) functions.push(name);
  });

  sourceFile.getClasses().forEach(cls => {
    const name = cls.getName();
    if (name) classes.push(name);
  });

  const dependencies = imports.filter(i => i.startsWith('.') || i.startsWith('/'));

  const fileMeta: FileMeta = {
    filePath,
    language: getFileLanguage(filePath),
    fileSize,
    numLines,
    imports,
    exports,
    functions,
    classes,
    dependencies
  };

  return fileMeta;
}

function writeMetadataToFile<T>(metadata: T[], outputPath: string) {
  const resolved = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`Metadata written to ${resolved}`);
}

function generateFileMetadata() {
  const files = project.getSourceFiles().filter(file => {
    const filePath = file.getFilePath();
    return ![
      'node_modules', 'dist', 'build', 'out', '.git',
      '.next', '.vercel', '.github', '.vscode', '.idea', 'coverage'
    ].some(excluded => filePath.includes(path.sep + excluded + path.sep));
  });

  const allFileMeta: FileMeta[] = [];
  for (const file of files) {
    allFileMeta.push(extractFileMeta(file));
  }

  writeMetadataToFile(allFileMeta, './.metadata/files.json');
}

export default generateFileMetadata;
