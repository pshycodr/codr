import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";


config();

export const llm = new ChatGoogleGenerativeAI ({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY
});


