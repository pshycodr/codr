import fs from "fs";
import path from "path";
import {
	type ArrowFunction,
	type FunctionDeclaration,
	type MethodDeclaration,
	Node,
	Project,
	type SourceFile,
} from "ts-morph";

interface CallGraphEdge {
	caller: string;
	callee: string;
	filePath: string;
	line: number;
}

interface CallGraphNode {
	functionName: string;
	filePath: string;
	calls: string[];
	calledBy: string[];
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

function getFunctionName(
	node: FunctionDeclaration | ArrowFunction | MethodDeclaration,
): string {
	if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
		return node.getName() || "<anonymous>";
	} else if (Node.isArrowFunction(node)) {
		const parent = node.getParent();
		if (Node.isVariableDeclaration(parent)) {
			return parent.getName();
		}
	}
	return "<anonymous>";
}

function extractFunctionDeclarations(
	sourceFile: SourceFile,
): Record<string, string> {
	const functionMap: Record<string, string> = {};

	sourceFile.forEachDescendant((desc) => {
		if (
			Node.isFunctionDeclaration(desc) ||
			Node.isArrowFunction(desc) ||
			Node.isMethodDeclaration(desc)
		) {
			const name = getFunctionName(desc);
			if (name !== "<anonymous>") {
				functionMap[name] = sourceFile.getFilePath();
			}
		}
	});

	return functionMap;
}

function extractCallGraphEdges(sourceFile: SourceFile): CallGraphEdge[] {
	const edges: CallGraphEdge[] = [];

	sourceFile.forEachDescendant((desc) => {
		if (
			Node.isFunctionDeclaration(desc) ||
			Node.isArrowFunction(desc) ||
			Node.isMethodDeclaration(desc)
		) {
			const functionName = getFunctionName(desc);
			const filePath = sourceFile.getFilePath();

			desc.forEachDescendant((sub) => {
				if (Node.isCallExpression(sub)) {
					const expr = sub.getExpression();
					if (Node.isIdentifier(expr)) {
						const calleeName = expr.getText();
						edges.push({
							caller: functionName,
							callee: calleeName,
							filePath,
							line: sub.getStartLineNumber(),
						});
					}
				}
			});
		}
	});

	return edges;
}

function generateCallGraph() {
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

	const edges: CallGraphEdge[] = [];
	const globalFunctionMap: Record<string, string> = {};

	for (const file of files) {
		Object.assign(globalFunctionMap, extractFunctionDeclarations(file));
		edges.push(...extractCallGraphEdges(file));
	}

	const callsMap: Record<string, Set<string>> = {};
	const calledByMap: Record<string, Set<string>> = {};

	for (const edge of edges) {
		const callerKey = `${edge.filePath}::${edge.caller}`;
		const calleeFile = globalFunctionMap[edge.callee];
		const calleeKey = calleeFile
			? `${calleeFile}::${edge.callee}`
			: `${edge.filePath}::${edge.callee}`;

		if (!callsMap[callerKey]) callsMap[callerKey] = new Set();
		if (!calledByMap[calleeKey]) calledByMap[calleeKey] = new Set();

		callsMap[callerKey].add(calleeKey);
		calledByMap[calleeKey].add(callerKey);
	}

	const allKeys = new Set([
		...Object.keys(callsMap),
		...Object.keys(calledByMap),
	]);

	const graph: CallGraphNode[] = Array.from(allKeys).map((key) => {
		const [filePath, functionName] = key.split("::");
		return {
			functionName: functionName || "<anonymous>",
			filePath: filePath || "",
			calls: Array.from(callsMap[key] || []),
			calledBy: Array.from(calledByMap[key] || []),
		};
	});

	const outputPath = path.resolve("./.codr/metadata/callgraph.json");
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2), "utf-8");
	console.log(`Call graph written to ${outputPath}`);
}

export default generateCallGraph;
