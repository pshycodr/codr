import chalk from "chalk";
import { sendChatMessageToRag, startChatSession } from "../../transport/zeromqClient"
import { startChatUI } from "../ui/chatUI";

interface CallRAG {
    path?: string;
    query: string;
    type?: 'doc' | 'webpage';
}

export const chatWithContext = async (data: CallRAG) => {

    const { session_id, query } = await startChatSession(data)

    // console.log(chalk.bgCyanBright.black("Initial Response: "), response);

    if (!query) throw new Error("Query is required to start chat");

    const decision = await sendChatMessageToRag({ message: query, session_id });

    if (!decision) throw new Error("No Decision Available");

    const firstReply = "No initial response";

    await startChatUI(session_id, query, decision);

}