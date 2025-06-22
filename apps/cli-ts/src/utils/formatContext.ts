
export default function formatContext(chunks: string[]): string {
    return chunks
        .map((chunk, i) => `(${i + 1}) ${chunk.trim()}`)
        .join("\n\n");
}