import chalk from 'chalk';

import { randomUUID } from 'crypto';

import zmq from 'zeromq';
import formatContext from '../utils/formatContext';
import { getCompletionFromOpenRouter } from '../core/agents/ragAnswerAI';

interface CallRAG {
    path?: string;
    query?: string;
    type?: 'doc' | 'webpage';
    session_id?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const callRAG = async (data: CallRAG) => {

    const socket = new zmq.Request();

    try {
        await socket.connect("tcp://127.0.0.1:5555");

        await delay(100);

        const start = Date.now();
        await socket.send(JSON.stringify(data));

        const [result] = await socket.receive();


        if (!result) {
            throw new Error("No r`esponse received from ZeroMQ server.");
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

export const startChatSession = async ({ path, query, type }: CallRAG) => {

    const session_id = randomUUID();

    const payLoad = {
        chat_type: "init_chat",
        path,
        query,
        type,
        session_id
    };

    const response = await callRAG(payLoad);

    return { session_id, response };
};

export async function sendChatMessageToRag({ message, session_id }: { message: string, session_id: string }) {

    const payload = {
        chat_type: "chat_message",
        message,
        session_id
    };

    const { success: ragSuccess, response: context } = await callRAG(payload);
    
    const formattedContext = formatContext(context.results);

    const {decision} = await getCompletionFromOpenRouter({query: message, context: formattedContext})


    return decision;
}
