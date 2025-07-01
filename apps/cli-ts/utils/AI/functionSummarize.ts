import { GoogleGenAI } from '@google/genai';
import chalk from 'chalk';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type CodeEntity = {
  entity_name: string;
  code: string;
  entity_type: string;
  file_path: string;
  start_line: number;
  end_line: number;
};

type CodeEntityWithDescription = CodeEntity & {
  description: string;
};

// Utility to extract JSON array from model output
export function extractJSONArrayFromText(text: string): any[] {
  try {
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = text.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonStr);
    }
  } catch (err) {
    console.error("❌ JSON parse error:", err);
  }
  console.warn("⚠️ No valid JSON array found in model output.");
  return [];
}

export async function summarizeFunctionsWithDescriptions(
  entities: CodeEntity[],
  model = "gemma-3-1b-it"
): Promise<CodeEntityWithDescription[]> {
  const summarizedEntities: CodeEntityWithDescription[] = [];

  for (let i = 0; i < entities.length; i += 10) {
    const batch = entities.slice(i, i + 10);

    const prompt = `
You are an expert code summarizer. Return ONLY a JSON array (no Markdown, no comments, no extra text), where each item has:
- name: exact function or class name
- description: brief, clear explanation of what it does
[
{
  "name": "readFile",
  "description": "Reads the contents of a file and logs a message to the console."
}
{
  "name": "writeFile",
  "description": "Writes a string to a file, handling potential errors during the process."
}
]

Use only the provided code — do not invent or assume anything.

Functions:
${batch.map((f, idx) => `### ${idx + 1}. ${f.entity_name}\n${f.code}`).join("\n\n")}
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],

      });

      const output = response.text;
      console.log(chalk.bgGreenBright.black("Retrieve data from gemini: "), output);

      // @ts-ignore
      const summaries: { name: string; description: string }[] = extractJSONArrayFromText(output) || [];

      for (const entity of batch) {
        const match = summaries.find((s) => s.name === entity.entity_name);
        summarizedEntities.push({
          ...entity,
          description: match?.description || "No description found.",
        });
      }
    } catch (error) {
      console.error("❌ Google API Error:", error);
      for (const entity of batch) {
        summarizedEntities.push({ ...entity, description: "Error from model." });
      }
    }
  }

  return summarizedEntities;
}