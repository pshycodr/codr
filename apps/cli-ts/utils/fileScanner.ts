import fg from "fast-glob";

export function scanFilesByExtension(exts: string[]): string[] {
	return fg.sync(`**/*.{${exts.join(",")}}`, {
		ignore: [
			"**/node_modules/**",
			"**/.git/**",
			"**/dist/**",
			"**/build/**",
			"**/.next/**",
			"**/.vercel/**",
			"**/.vscode/**",
			"**/.idea/**",
			"**/.github/**",
			"**/coverage/**",
		],
		absolute: true,
	});
}
