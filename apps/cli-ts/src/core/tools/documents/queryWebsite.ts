import chalk from "chalk";
import callRAG from "@transport/zeromqClient";
import formatContext from "@utils/formatContext";

import { config } from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
config({ path: envPath });

interface QueryData {
    path: string;
    query: string;
    type?: 'doc' | 'webpage'
}

export async function queryWebsite(data: QueryData): Promise<{ success: boolean; decision?: string }> {
    try {
        console.log(chalk.yellowBright("QueryWebsite Called\n"));
        const { success: ragSuccess, response: context } = await callRAG(data);

        // console.log(chalk.yellowBright("Context: "),  context);
        const formattedContext = formatContext(context.results);
        // console.log(chalk.yellowBright("formattedContext: "),  formattedContext);

        if (!ragSuccess) {
            console.log(chalk.redBright("❌ Failed to retrieve context from RAG."));
            return { success: false };
        }

        const completionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "openrouter-chat"
            },
            body: JSON.stringify({
                // model: "deepseek/deepseek-r1:free",
                model: 'mistralai/mistral-7b-instruct',
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
                        ${data.query}
                        
                        ---
                        
                        Context:
                        ${formattedContext}
                        
                        ---
                        
                        Answer:
                        `.trim()

                    }
                ]
            }),
        });

        const result: any = await completionResponse.json();

        if (!completionResponse.ok) {
            throw new Error(`❌ API Error: ${JSON.stringify(result)}`);
        }

        const decision = result.choices?.[0]?.message?.content?.trim();


        if (!decision) {
            console.log(chalk.red("⚠️ No valid response from model."));
            return { success: false };
        }

        console.log(chalk.yellow("✅ Decision made:"), decision);

        return { success: true, decision };

    } catch (error: any) {
        console.error(chalk.red("❌ Error in queryWebsite:"), error.message || error);
        return { success: false };
    }
}

