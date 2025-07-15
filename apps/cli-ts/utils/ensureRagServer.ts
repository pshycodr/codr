import { spawn } from "child_process";
import { RagClient } from "@transport/zeromqClient";
import { join } from "path";

const projectRoot = join(__dirname, "..", "..", "..");

function startRagServerInBackground() {
    const subprocess = spawn("uv run -m apps.rag_py.transport.zeromq.server", {
        shell: true,
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        cwd: projectRoot,
    });

    subprocess.unref();
}

function timeoutPromise(ms: number) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: RAG server not responding.")), ms)
    );
}

interface RagResponse {
    success: boolean;
    response?: { success: boolean; msg?: string };
    error?: any;
}

async function checkRagServer(timeout = 3000): Promise<RagResponse> {
    const ragClient = new RagClient();
    const result: RagResponse = await Promise.race([
        ragClient.callRagOnce({ type: "ping" }),
        timeoutPromise(timeout) as Promise<never>,
    ]);

    if (!result || !result.success || !result.response?.success) {
        throw new Error("RAG server responded, but not healthy.");
    }

    return result;
}

export async function ensureRagServerRunning(): Promise<boolean> {
    const RETRY_INTERVAL_MS = 5000;
    const MAX_BOOT_WAIT_TIME_MS = 180000; // 3 minutes
    const MAX_RETRIES = Math.ceil(MAX_BOOT_WAIT_TIME_MS / RETRY_INTERVAL_MS);

    try {
        console.log("🔌 Connecting to RAG...");
        const res = await checkRagServer();
        console.log("✅ Connected to RAG:", res.response?.msg || "pong");
        return true;
    } catch (_) {
        startRagServerInBackground();
    }

    // Retry loop after starting
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_BOOT_WAIT_TIME_MS) {
        await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
        try {
            const res = await checkRagServer();
            console.log("✅ Connected to RAG:", res.response?.msg || "pong");
            return true;
        } catch (_) {
            // silently retry
        }
    }

    console.error("❌ Failed to connect to RAG server after 3 minutes.");
    return false;
}
