import chalk from "chalk";
import { randomUUID } from "crypto";
import { getSummarizeChat } from "../utils/AI/chatSummarizer";
import { getCompletionFromOpenRouter } from "../utils/AI/ragAnswerAI";
import { formatContextForLLM } from "../utils/formatContext";
import type { RagClient } from "./zeromqClient";

export class ChatSessionManager {
	private ragClient: RagClient;
	private sessionId: string;
	private previousSummary = "";
	type: string | undefined;

	constructor(ragClient: RagClient) {
		this.ragClient = ragClient;
		this.sessionId = randomUUID();
	}

	async startSession({
		path,
		query,
		type,
	}: {
		path: string;
		query: string;
		type: string;
	}) {
		const payload = {
			chat_type: "init_chat",
			path,
			query,
			type,
			session_id: this.sessionId,
		};
		this.type = type;
		const { success, response } = await this.ragClient.callRagOnce(payload);
		console.log(chalk.greenBright(response.msg));
		return { session_id: this.sessionId, query };
	}

	async sendMessage(message: string) {
		const payload = {
			chat_type: "chat_message",
			message,
			session_id: this.sessionId,
			type: this.type,
		};

		const { success, response, error } =
			await this.ragClient.callRagOnce(payload);

		// console.log(success, response, response.type);

		if (!success || !response?.success) {
			console.error("❌ RAG call failed:", response?.error || error);
			throw new Error("RAG failed to return context");
		}

		const formattedContext = formatContextForLLM(response.data, response.type);

		const { decision } = await getCompletionFromOpenRouter({
			query: message,
			context: formattedContext,
			summary: this.previousSummary,
		});

		const currentChat = {
			user_query: message,
			assistant_answer: decision,
		};

		// Optionally update summary in background
		// this.updateSummary(currentChat);

		return decision;
	}

	private async updateSummary(currentChat: any) {
		const { success, decision: newSummary } = await getSummarizeChat({
			chat: currentChat,
			prevSummary: this.previousSummary,
		});

		if (success && newSummary) {
			this.previousSummary = newSummary;
			console.log("📝 Chat Summary Updated.");
		}
	}
}
