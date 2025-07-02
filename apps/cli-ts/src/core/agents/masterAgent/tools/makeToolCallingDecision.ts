import chalk from "chalk";
import { fileTools } from "@core/agents/fileAgent/fileTools"; 
import { codeTools } from "@core/agents/codeAgent/CodeTools";

export const makeToolCallingDecision = async (task: string) => {
    console.log(chalk.bgGreen("makeToolCallingDecision Called"));
    
    try {
        console.log("sending response");
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "openrouter-chat"
            },
            body: JSON.stringify({
                model: "qwen/qwen3-32b-04-28:free",
                // model: "deepseek/deepseek-r1-0528:free",
                messages: [
                    {
                        role: "system",
                        content: `
                      You are an AI agent that receives a user's natural language task and must plan how to solve it using available tools.
                      
                      Your job:
                      - Break the task into clear, logical steps.
                      - Select the most suitable tools for each step from the list below.
                      - Justify tool selection when necessary.
                      - Only return a structured, numbered plan. No extra commentary.
                      
                      User Task:
                      "${task}"
                      
                      Available Tools:
                      ${fileTools.map(t => `- ${t.name}: ${t.description}`).join("\n")}
                      
                      Now, analyze the task and return a detailed, step-by-step plan using the tools provided.
                      Only return the plan, nothing else.
                      `
                    }
                ]
            }),
        });

      console.log("got ", response);

        const data: any = await response.json();
        console.log("🔍 Raw AI Response:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            throw new Error(`❌ API Error: ${JSON.stringify(data)}`);
        }

        const decision = data.choices[0].message.content.trim();
        console.log(chalk.yellow("Decision made: ", JSON.stringify(decision)));

        return { success: true, decision };

    } catch (error: any) {
        console.error("❌ Error from makeToolCallingDecision:", error);
        return { success: false, error: error.message };
    }
};