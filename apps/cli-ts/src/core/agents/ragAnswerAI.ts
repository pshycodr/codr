import chalk from "chalk";

interface CompletionInput {
    query: string;
    context: string;
    model?: string;
    summary? : string
}

export async function getCompletionFromOpenRouter({
    query,
    context,
    summary,
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
                        You are a precise, context-aware assistant. Your job is to generate accurate, complete, and clear answers using the information provided in the current context and the ongoing conversation's summary.

                        Guidelines:
                        - Base your answer on the combination of:
                            1. The **current retrieved context** (from documents or web),
                            2. The **previous chat summary** (which gives conversation continuity).
                        - Use **only** information explicitly present in the context or summary. Do not assume or invent anything not included.
                        - If neither the summary nor the context contain the answer, respond with: "I don't know based on the provided context."
                        - Provide full, detailed answers. Include names, actions, motivations, technical points, or facts if they are present.
                        - Avoid vague statements or generalizations. Be concrete, specific, and technically accurate.
                        - Use natural, plain English and write in **clear, complete sentences**.
                        - Do **not** summarize the context or the summary—only use them to accurately answer the user's question.

                        ---
                        Previous Chat Summary:
                        ${summary || "No previous summary."}

                        ---
                        Question:
                        ${query}

                        ---
                        Context:
                        ${context}

                        ---
                        Answer:
                        `
                        .trim(),
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
