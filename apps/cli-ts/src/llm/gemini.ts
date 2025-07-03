import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
import path from "path";


const envPath = path.resolve(__dirname, "../../.env");
config({ path: envPath });

export const llm = new ChatGoogleGenerativeAI ({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY
});