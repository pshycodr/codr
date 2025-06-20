import chalk from "chalk";
import { tools } from ".";

export const makeToolCallingDecision = async (task: string) => {
    console.log(chalk.bgGreen("makeToolCallingDecision Called"));
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "openrouter-chat"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "system",
                        content: `
                            user task : ${task}
                            you have these tools:
                            ${tools.map(t => `- ${t.name}: ${t.description}`).join("\n")}
            
                            make a detailed decision of how you will execute this task based on the tools you have.
                            only return the decision as your response, and nothing else.
                        `
                    }
                ]
            }),
        });

        const data: any = await response.json()

        if (!response.ok) {
            throw new Error(`❌ API Error: ${JSON.stringify(data)}`);
        }

        const decision = data.choices[0].message.content.trim();
        console.log(chalk.yellow("Decision made: ", decision));

        return { success: true, decision }

    } catch (error) {
        console.error("Error from makeToolCallingDecision: ", error);
        { success: false }
    }

}