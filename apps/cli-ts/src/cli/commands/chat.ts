import chalk from "chalk";
import { startChatSession } from "../../transport/zeromqClient"
import { startChatUI } from "../ui/chatUI";

interface CallRAG {
    path?: string;
    query?: string;
    type?: 'doc' | 'webpage';
}

export const chatWithContext = async (data :CallRAG ) => {

    const {session_id, response} = await startChatSession(data)

    console.log(chalk.bgCyanBright.black("Initial Response: "), response);
    

    const firstReply = response?.response?.decision || "No initial response";
    await startChatUI(session_id, firstReply);

}