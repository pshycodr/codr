import fs from "fs";
import path from "path";
import {
	type MethodDeclaration,
	Project,
	type PropertyDeclaration,
	type SourceFile,
} from "ts-morph";

interface ClassMeta {
	name: string;
	filePath: string;
	startLine: number;
	endLine: number;
	extends?: string;
	implements?: string[];
	properties: {
		name: string;
		type?: string;
		accessModifier?: "public" | "private" | "protected";
		defaultValue?: string;
	}[];
	methods: {
		name: string;
		startLine: number;
		endLine: number;
		isStatic?: boolean;
		accessModifier?: "public" | "private" | "protected";
	}[];
	docstring?: string;
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
	"**/*.{ts,tsx,js,jsx}",
	"!**/node_modules/**/*",
	"!**/dist/**/*",
	"!**/build/**/*",
	"!**/out/**/*",
	"!**/.next/**/*",
	"!**/.vercel/**/*",
	"!**/.vscode/**/*",
	"!**/.idea/**/*",
	"!**/.github/**/*",
	"!**/coverage/**/*",
]);

function extractClassMeta(sourceFile: SourceFile): ClassMeta[] {
	const results: ClassMeta[] = [];

	sourceFile.getClasses().forEach((cls) => {
		const props = cls.getProperties().map((prop: PropertyDeclaration) => ({
			name: prop.getName(),
			type: prop.getType().getText(),
			accessModifier: prop.getScope() || "public",
			defaultValue: prop.getInitializer()?.getText(),
		}));

		const methods = cls.getMethods().map((method: MethodDeclaration) => ({
			name: method.getName(),
			startLine: method.getStartLineNumber(),
			endLine: method.getEndLineNumber(),
			isStatic: method.isStatic(),
			accessModifier: method.getScope() || "public",
		}));

		const classMeta: ClassMeta = {
			name: cls.getName() || "<anonymous>",
			filePath: sourceFile.getFilePath(),
			startLine: cls.getStartLineNumber(),
			endLine: cls.getEndLineNumber(),
			extends: cls.getExtends()?.getText(),
			implements: cls.getImplements().map((i) => i.getText()),
			properties: props,
			methods: methods,
			docstring: cls
				.getJsDocs()
				.map((doc) => doc.getComment())
				.filter(Boolean)
				.join("\n"),
		};

		results.push(classMeta);
	});

	return results;
}

function writeMetadataToFile<T>(metadata: T[], outputPath: string) {
	const resolved = path.resolve(outputPath);
	fs.mkdirSync(path.dirname(resolved), { recursive: true });
	fs.writeFileSync(resolved, JSON.stringify(metadata, null, 2), "utf-8");
	console.log(`Metadata written to ${resolved}`);
}

function generateClassMetadata() {
	const files = project.getSourceFiles().filter((file) => {
		const filePath = file.getFilePath();
		return ![
			"node_modules",
			"dist",
			"build",
			"out",
			".git",
			".next",
			".vercel",
			".github",
			".vscode",
			".idea",
			"coverage",
		].some((excluded) => filePath.includes(path.sep + excluded + path.sep));
	});

	const allClassMeta: ClassMeta[] = [];
	for (const file of files) {
		allClassMeta.push(...extractClassMeta(file));
	}

	writeMetadataToFile(allClassMeta, "./.codr/metadata/classes.json");
}

export default generateClassMetadata;
