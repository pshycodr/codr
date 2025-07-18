import chalk from "chalk";
import { RagClient} from "@transport/zeromqClient"
import { startChatUI } from "@cli/ui/chatUI";
import { ChatSessionManager } from "@transport/chatSessionManager";
import { message } from "blessed";
import { startChatUI2 } from "@cli/ui/chatUI2";

interface CallRAG {
    path: string;
    query: string;
    type: 'doc' | 'webpage' | 'codebase';
}

export const chatWithContext = async (data: CallRAG) => {
    const ragClient = new RagClient()
    const chatManager = new ChatSessionManager(ragClient)

    const { session_id, query } = await chatManager.startSession(data)

    // console.log(chalk.bgCyanBright.black("Initial Response: "),session_id, query, data.type);

    if (!query) throw new Error("Query is required to start chat");

    const decision = await chatManager.sendMessage(query);

    if (!decision) throw new Error("No Decision Available");

    const firstReply = "No initial response";

    await startChatUI2(session_id, query, decision, chatManager);

}