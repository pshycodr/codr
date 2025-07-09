import { parseCodebase } from "@codebase";
import { summarizeFunctionsWithDescriptions } from "@utils/AI/functionSummarize";
import chalk from "chalk";
import callRAG, { RagClient } from "@transport/zeromqClient";
import { getCompletionFromOpenRouter } from "@utils/AI/ragAnswerAI";
import { formatContextForLLM } from "@utils/formatContext";

type CodeEntity = {
    entity_name: string;
    code: string;
    entity_type: string;
    file_path: string;
    start_line: number;
    end_line: number;
    description?: string;
};

interface QueryData {
    path: string;
    query: string;
    parsedCodebase?: CodeEntity[];
    type: 'codebase';
}



const Rag = new RagClient();

export async function indexCodebase (data: QueryData) {
    try {
        const { success, response } = await Rag.callRagOnce({ type: 'check_collection', path: data.path });
        console.log(response, success);

        if (!response.exists) {
            // Parse & summarize codebase
            console.log(chalk.cyan("🔍 Parsing and summarizing codebase..., path: "), data.path);
            const parsed = await parseCodebase(data.path);
            console.log(chalk.cyanBright("📄 Parsed:"), parsed?.length, "items");

            // const summarized = await summarizeFunctionsWithDescriptions(parsed);
            // console.log(chalk.cyanBright("🧠 Summarized:"), summarized?.length, "items");

            // data.parsedCodebase = summarized;
            data.parsedCodebase = parsed
        }

        // RAG context fetch
        console.log(chalk.yellowBright("📡 Sending to RAG..."));
        const { success: ragSuccess, response: context } = await callRAG(data);

        if (!ragSuccess || !context) {
            console.log(chalk.redBright("❌ Failed to retrieve context from RAG."));
            return { success: false };
        }

        console.log(chalk.greenBright("📥 Context Received"));

        // Format for LLM
        const formattedContext = formatContextForLLM(context, 'codebase');

        // LLM reasoning
        console.log(chalk.yellow("🧠 Performing LLM Reasoning..."));
        const { success: llmSuccess, decision } = await getCompletionFromOpenRouter({
            query: data.query,
            context: formattedContext,
        });

        if (!llmSuccess || !decision) {
            console.log(chalk.red("⚠️ No valid response from model."));
            return { success: false };
        }

        console.log(chalk.green("✅ Decision made:\n"), decision);
        return { success: true, decision };

    } catch (error: any) {
        console.error(chalk.red("❌ Unexpected Error:"), error.message || error);
        return { success: false };
    }
};


