import chalk from "chalk";

interface CompletionInput {
    query: string;
    context: string;
    model?: string; 
}

export async function getCompletionFromOpenRouter({
    query,
    context,
    model = "mistralai/mistral-7b-instruct", // Default model
}: CompletionInput): Promise<{ success: boolean; decision?: string }> {
    try {
        const completionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "openrouter-chat",
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: `
You are a helpful assistant. Use the following context to answer the user's question clearly and accurately.

- Only answer using the information explicitly provided in the context.
- Do not add, infer, or assume anything that is not clearly stated in the context.
- If the context does not contain the answer, respond with: "I don't know based on the provided context."
- Keep the answer brief but informative — ideally 2 to 4 sentences.
- Use plain language. Do not use markdown, bullet points, or lists.

---
Question:
${query}

---
Context:
${context}

---
Answer:
`.trim(),
                    },
                ],
            }),
        });

        const result: any = await completionResponse.json();

        if (!completionResponse.ok) {
            throw new Error(`❌ API Error: ${JSON.stringify(result)}`);
        }

        const decision = result.choices?.[0]?.message?.content?.trim();

        if (!decision) {
            return { success: false };
        }

        return { success: true, decision };
    } catch (err: any) {
        console.error(chalk.red("❌ Error in OpenRouter request:"), err.message);
        return { success: false };
    }
}
