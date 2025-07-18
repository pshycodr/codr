import {
	FunctionDeclaration,
	type Node,
	SyntaxKind,
	VariableStatement,
} from "ts-morph";
import type { CodeEntity } from "../shared/types/codeEntity.types";
import { getCodeFromLines } from "../utils/helper";

export function extractFunctions(
	node: Node,
	lines: string[],
	filePath: string,
): CodeEntity[] {
	const results: CodeEntity[] = [];

	// FunctionDeclaration
	if (node.getKind() === SyntaxKind.FunctionDeclaration) {
		const fn = node.asKind(SyntaxKind.FunctionDeclaration);
		if (fn && fn.getName()) {
			const fnName = fn.getName();
			const start = fn.getStartLineNumber();
			const end = fn.getEndLineNumber();
			results.push({
				// @ts-ignore
				entity_name: fnName,
				entity_type: "function",
				start_line: start,
				end_line: end,
				code: getCodeFromLines(lines, start, end),
				file_path: filePath,
			});
		}
	}

	// VariableStatement for arrow/function expressions
	if (node.getKind() === SyntaxKind.VariableStatement) {
		const vs = node.asKind(SyntaxKind.VariableStatement);
		if (vs) {
			vs.getDeclarations().forEach((decl) => {
				const initializer = decl.getInitializer();
				if (
					initializer &&
					(initializer.getKind() === SyntaxKind.ArrowFunction ||
						initializer.getKind() === SyntaxKind.FunctionExpression)
				) {
					const name = decl.getName();
					const start = decl.getStartLineNumber();
					const end = decl.getEndLineNumber();
					results.push({
						entity_name: name,
						entity_type: "arrow_function",
						start_line: start,
						end_line: end,
						code: getCodeFromLines(lines, start, end),
						file_path: filePath,
					});
				}
			});
		}
	}

	return results;
}
