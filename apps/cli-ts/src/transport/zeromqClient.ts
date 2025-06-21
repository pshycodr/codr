import chalk from 'chalk';
import zmq from 'zeromq';

interface CallRAG {
    url: string;
    query: string;
    type? : 'doc' | 'webpage' 
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const callRAG = async (data: CallRAG) => {
    console.log(chalk.yellowBright("🔁 callRAG Called"));

    const socket = new zmq.Request();

    try {
        console.log(chalk.yellowBright("🔌 Connecting to ZeroMQ..."));
        await socket.connect("tcp://127.0.0.1:5555");

        await delay(100); // 👈 Important: let connection stabilize

        console.log(chalk.yellowBright("📤 Sending request..."));
        await socket.send(JSON.stringify(data));

        console.log(chalk.yellowBright("⏳ Waiting for response..."));
        const [result] = await socket.receive();

        if (!result) {
            throw new Error("No response received from ZeroMQ server.");
        }

        const response = JSON.parse(result.toString());
        // console.log(chalk.greenBright("✅ Response received:"), response);

        return { success: true, response };
    } catch (error) {
        console.error(chalk.redBright("❌ Error in callRAG:"), error);
        return { success: false, error };
    } finally {
        // Close the socket with a slight delay after receive
        await delay(50);
        await socket.close();
        console.log(chalk.gray("🔒 ZeroMQ socket closed."));
    }
};

export default callRAG;
