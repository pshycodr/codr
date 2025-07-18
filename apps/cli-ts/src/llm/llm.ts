import { ChatAnthropic } from "@langchain/anthropic";
import { ChatDeepSeek } from "@langchain/deepseek";
// Langchain LLMs
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
config({ path: envPath });

const selectedLLM = process.env.SELECTED_LLM;
const model = process.env.LLM_MODEL;

if (!selectedLLM || !model) {
	throw new Error("Missing SELECTED_LLM or LLM_MODEL in .env");
}

export let llm: any;

switch (selectedLLM) {
	case "gemini":
		if (!process.env.GEMINI_API_KEY)
			throw new Error("Missing GEMINI_API_KEY in .env");
		llm = new ChatGoogleGenerativeAI({
			model,
			apiKey: process.env.GEMINI_API_KEY,
		});
		break;

	case "openai":
		if (!process.env.OPENAI_API_KEY)
			throw new Error("Missing OPENAI_API_KEY in .env");
		llm = new ChatOpenAI({
			modelName: model,
			openAIApiKey: process.env.OPENAI_API_KEY,
		});
		break;

	case "claude":
		if (!process.env.CLAUDE_API_KEY)
			throw new Error("Missing CLAUDE_API_KEY in .env");
		llm = new ChatAnthropic({
			modelName: model,
			anthropicApiKey: process.env.CLAUDE_API_KEY,
		});
		break;

	case "deepseek":
		if (!process.env.DEEPSEEK_API_KEY)
			throw new Error("Missing DEEPSEEK_API_KEY in .env");
		llm = new ChatDeepSeek({
			modelName: model,
			apiKey: process.env.DEEPSEEK_API_KEY,
		});
		break;

	default:
		throw new Error(`Unsupported LLM provider: ${selectedLLM}`);
}
