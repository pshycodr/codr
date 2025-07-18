import chalk from "chalk";

type ChatMessage = {
	user_query: string | undefined;
	assistant_answer: string | undefined;
};

interface CompletionInput {
	chat: ChatMessage;
	prevSummary?: string;
	model?: string;
}

export async function getSummarizeChat({
	chat,
	prevSummary,
	model = "deepseek/deepseek-r1-0528:free", // Default model
}: CompletionInput): Promise<{ success: boolean; decision?: string }> {
	try {
		const completionResponse = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
					"Content-Type": "application/json",
					"X-Title": "openrouter-chat",
				},
				body: JSON.stringify({
					model,
					messages: [
						{
							role: "system",
							content: `
                        You are a precise, context-aware assistant. Your job is to generate a complete and accurate **summary** of the entire conversation, using only the information from the given context.
                        
                        Guidelines:
                        - Summarize the **entire chat**, preserving key **user questions**, **AI answers**, and the **flow of conversation**.
                        - Include all **important points**, **decisions**, **observations**, or **requests** made during the chat.
                        - Preserve any relevant **technical context**, such as file paths, tools, model names, performance issues, or error descriptions.
                        - Be concise, but **do not omit** critical insights, actions taken, or problem-solving steps.
                        - Use **only** the information explicitly present in the chat. Do **not** add external knowledge or assume missing details.
                        - Write in **natural, plain English**, using **clear and complete sentences**.
                        - Avoid vague or generic summaries—stay specific and faithful to the original content.
                        
                        ---
                        PREVIOUS CHAT SUMMARY:
                        ${prevSummary || "No previous Summary"}

                        ---
                        CHAT:
                        user_query : ${chat.user_query}
                        assistant_answer : ${chat.assistant_answer}
                        
                        ---
                        New Summary (Previous Summary + Current chat):
                        `.trim(),
						},
					],
				}),
			},
		);

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
