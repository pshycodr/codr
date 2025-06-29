import chalk from 'chalk';

import { randomUUID } from 'crypto';

import zmq from 'zeromq';
import formatContext from '../utils/formatContext';
import { getCompletionFromOpenRouter } from '../core/agents/ragAnswerAI';
import { getSummarizeChat } from '../core/agents/chatSummarizer';

interface CallRAG {
    path?: string;
    query?: string;
    type?: string;
    session_id?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const callRAG = async (data: CallRAG) => {

    const socket = new zmq.Request();

    try {
        await socket.connect("tcp://127.0.0.1:5500");

        await delay(100);
        // data.type = 'check_collection'
        const start = Date.now();
        await socket.send(JSON.stringify(data));

        const [result] = await socket.receive();


        if (!result) {
            throw new Error("No response received from ZeroMQ server.");
        }

        const response = JSON.parse(result.toString());

        return { success: true, response };
    } catch (error) {
        return { success: false, error };
    } finally {
        await delay(50);
        await socket.close();
    }
};

export default callRAG;

export class RagClient {
    private endpoint: string;

    constructor(endpoint = 'tcp://127.0.0.1:5500') {
        this.endpoint = endpoint;
    }

    private async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async callRagOnce(payload: any) {
        const socket = new zmq.Request();

        try {
            await socket.connect(this.endpoint);
            await this.delay(100); // Small delay to ensure socket is ready

            await socket.send(JSON.stringify(payload));

            const [result] = await socket.receive();
            if (!result) {
                throw new Error("No response received from ZeroMQ server.");
            }

            const response = JSON.parse(result.toString());
            return { success: true, response };
        } catch (error) {
            return { success: false, error };
        } finally {
            await this.delay(50); // Ensure response is fully handled
            await socket.close();
        }
    }
}

export const startChatSession = async ({ path, query, type }: CallRAG) => {

    const session_id = randomUUID();

    const payload = {
        chat_type: "init_chat",
        path,
        query,
        type,
        session_id
    };

    const { success, response } = await callRAG(payload);

    console.log(chalk.greenBright(response.msg));


    return { session_id, query };
};


let previousSummary = "";

export async function sendChatMessageToRag({ message, session_id }: { message: string, session_id: string }) {
    const payload = {
        chat_type: "chat_message",
        message,
        session_id
    };

    const { success: ragSuccess, response: context } = await callRAG(payload);
    const formattedContext = formatContext(context.results);

    const { decision } = await getCompletionFromOpenRouter({ query: message, context: formattedContext, summary: previousSummary });

    const currentChat = {
        user_query: message,
        assistant_answer: decision
    };

    // void (async () => {
    //     const { success, decision: newSummary } = await getSummarizeChat({
    //         chat: currentChat,
    //         prevSummary: previousSummary
    //     });

    //     if (success && newSummary) {
    //         previousSummary = newSummary;
    //         console.log("📝 Chat Summary Updated.");
    //     }
    // })();

    return decision;
}
