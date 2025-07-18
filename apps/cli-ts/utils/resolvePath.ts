import path from "path";

export const resolvePath = (relativePath: string) => {
	return path.resolve(process.cwd(), relativePath);
};
