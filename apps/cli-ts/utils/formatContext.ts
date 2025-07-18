export default function formatContext(chunks: string[]): string {
	return chunks.map((chunk, i) => `(${i + 1}) ${chunk.trim()}`).join("\n\n");
}

// utils/formatContext.ts

type ContextType = "doc" | "codebase" | "webpage";

export function formatContextForLLM(context: any, type: ContextType): string {
	if (type === "doc" || type === "webpage") {
		const chunks: string[] = Array.isArray(context)
			? context
			: context?.results || [];
		return chunks.map((chunk, i) => `(${i + 1}) ${chunk.trim()}`).join("\n\n");
	}

	if (type === "codebase") {
		const results = Array.isArray(context?.results) ? context.results : context;

		return results
			.map(([, item]: [any, any]) => {
				const { file_path, entity_name, code, description } = item;

				return (
					`🔹 **${entity_name}**\n` +
					`📁 File: ${file_path}\n` +
					(description ? `📝 Description: ${description}\n` : "") +
					`\`\`\`ts\n${code.trim()}\n\`\`\`\n`
				);
			})
			.join("\n");
	}

	throw new Error(`Unsupported context type: ${type}`);
}
