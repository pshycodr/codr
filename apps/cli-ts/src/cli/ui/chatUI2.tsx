import type { ChatSessionManager } from "@transport/chatSessionManager";
import chalk from "chalk";
import { Box, render, Text } from "ink";
import TextInput from "ink-text-input";
import { memo, useEffect, useRef, useState } from "react";
import MessageBubble from "./src/components/MessageBubble";
import ScrollableBox from "./src/components/ScrollableBox";

// Minimal color scheme matching DESIGN-1
const userPrefix = chalk.bold.blue("> You:");
const assistantPrefix = chalk.bold.green("> Assistant:");
const promptSymbol = chalk.gray("›");
const exitNotice = chalk.dim('(Type "exit" to quit)');

type Message = {
	sender: "user" | "assistant";
	content: string;
	loading?: boolean;
};

interface ChatUIProps {
	session_id: string;
	query: string;
	firstMessage: string;
	chatManager: ChatSessionManager;
}

const MessageList = memo(({ messages }: { messages: Message[] }) => (
	<>
		{messages.map((msg, i) => (
			<MessageBubble
				key={`${msg.sender}-${i}-${msg.content.length}`}
				sender={msg.sender}
				content={msg.content}
				loading={msg.loading}
			/>
		))}
	</>
));

const ChatUI = ({
	session_id,
	query,
	firstMessage,
	chatManager,
}: ChatUIProps) => {
	const [messages, setMessages] = useState<Message[]>([
		{ sender: "user", content: query },
		{ sender: "assistant", content: firstMessage },
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const scrollRef = useRef<{ scrollDown: () => void }>(null);

	const handleSubmit = async () => {
		if (!input.trim()) return;

		// Exit handling like DESIGN-1
		if (input.toLowerCase() === "exit") {
			console.log(chalk.dim("\nSession ended\n"));
			process.exit(0);
		}

		const userMessage = { sender: "user" as const, content: input };
		const loadingMessage = {
			sender: "assistant" as const,
			content: "Thinking...",
			loading: true,
		};

		setMessages((prev) => [...prev, userMessage, loadingMessage]);
		setInput("");
		setLoading(true);

		try {
			const result = await chatManager.sendMessage(input);
			const aiResponse: Message = {
				sender: "assistant",
				content: result || "undefined",
			};
			setMessages((prev) => [...prev.slice(0, -1), aiResponse]);
		} catch (error) {
			setMessages((prev) => [
				...prev.slice(0, -1),
				{
					sender: "assistant",
					content: `Error: ${error instanceof Error ? error.message : String(error)}`,
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		scrollRef.current?.scrollDown();
	}, [messages]);

	// Dynamic prompt like DESIGN-1
	const promptPlaceholder =
		messages.length > 2
			? `Continue? ${exitNotice}`
			: `Your request ${exitNotice}`;

	return (
		<Box flexDirection="column" width="100%" height="100%">
			{/* Chat history */}
			<Box flexDirection="column" flexGrow={1} overflow="hidden">
				<ScrollableBox ref={scrollRef}>
					<MessageList messages={messages} />
				</ScrollableBox>
			</Box>

			{/* Input area with DESIGN-1 styling */}
			<Box borderStyle="round" borderColor="gray">
				<Text>{promptSymbol} </Text>
				<TextInput
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
					placeholder={loading ? "Waiting for response..." : promptPlaceholder}
					showCursor={!loading}
					focus={!loading}
				/>
			</Box>
		</Box>
	);
};

export async function startChatUI2(
	session_id: string,
	query: string,
	firstMessage: string,
	chatManager: ChatSessionManager,
) {
	render(
		<ChatUI
			session_id={session_id}
			query={query}
			firstMessage={firstMessage}
			chatManager={chatManager}
		/>,
	);
}
