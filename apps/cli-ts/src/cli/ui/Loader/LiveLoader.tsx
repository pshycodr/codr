import { Box, Newline, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";

interface LiveLoaderProps {
	text: string;
	done?: boolean;
	doneText?: string;
	frames?: string[];
	interval?: number;
}

const defaultFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const LiveLoader: React.FC<LiveLoaderProps> = ({
	text,
	done = false,
	doneText = "✅ Done",
	frames = defaultFrames,
	interval = 80,
}) => {
	const [frameIndex, setFrameIndex] = useState(0);

	useEffect(() => {
		if (done) return;

		const timer = setInterval(() => {
			setFrameIndex((i) => (i + 1) % frames.length);
		}, interval);

		return () => clearInterval(timer);
	}, [done, interval]);

	return (
		<Box>
			<Newline />
			<Text color={done ? "green" : "cyan"}>
				{done ? doneText : `${frames[frameIndex]} ${text}`}
			</Text>
			<Newline />
		</Box>
	);
};

export default LiveLoader;
