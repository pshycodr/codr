
import { RagClient } from '@transport/zeromqClient';
import { formatContextForLLM } from '@utils/formatContext';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
import path from "path";
import chalk from 'chalk';


const envPath = path.resolve(__dirname, "../../.env");
config({ path: envPath });

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
});


export async function webSearch({ query }: { query: string }) {

    console.log(chalk.bgGreen("webSearch Called"), query);

    const res = await fetch(`https://customsearch.googleapis.com/customsearch/v1?cx=${process.env.GOOGLE_CSE_ID}&key=${process.env.GOOGLE_CSE_API_KEY}&num=2&q=${query}`)
    const data = await res.json();

    const urls: any = []

    // @ts-ignore
    data.items.forEach((item: any) => {
        urls.push(item.link)
    });

    const ragData = {
        urls,
        query,
        type: 'agent'
    }

    const rag = new RagClient()

    const { success, response, error } = await rag.callRagOnce(ragData)

    // const formattedContext = formatContextForLLM(response.results, "doc");

    console.log(chalk.yellow("Returned web response: \n"), response + "\n")

    // return `Here is the web search result, now provide the user with proper information based on this result:\n${response}`

    const prompt = `
You're helping debug the following issue: "${query}"

Here are some results from a web search:
${response}

Based on this info, explain the likely cause and recommend a fix, if available.
Return your answer in markdown, and be direct.

`


    const { content: llmresponse } = await llm.invoke(prompt)

    console.log(chalk.greenBright("\nLLM Response: \n"),llmresponse);

    return llmresponse

}