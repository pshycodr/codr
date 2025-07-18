import { Box, Newline, Text } from "ink";

const MessageBubble = ({
	sender,
	content,
	loading,
}: {
	sender: "user" | "assistant";
	content: string;
	loading?: boolean;
}) => {
	const color = sender === "user" ? "green" : "cyan";
	const prefix = sender === "user" ? "You" : "Assistant";

	return (
		<Box
			flexDirection="column"
			marginBottom={1}
			borderDimColor={loading}
			borderStyle={"single"}
		>
			<Text bold color={color}>
				{prefix}:
			</Text>
			<Text dimColor={loading}> {content} </Text>
			<Newline />
		</Box>
	);
};

export default MessageBubble;
