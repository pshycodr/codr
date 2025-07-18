import { Box, useApp, useInput } from "ink";
import React, { useRef, useState } from "react";

const ScrollableBox = React.forwardRef<
	{ scrollDown: () => void },
	{ children: React.ReactNode }
>(({ children }, ref) => {
	const [offset, setOffset] = useState(0);
	const { exit } = useApp();
	const contentRef = useRef<{ height: number }>({ height: 0 });

	// Expose scrollDown method via ref
	React.useImperativeHandle(ref, () => ({
		scrollDown: () => setOffset(0),
	}));

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}

		if (key.upArrow) {
			setOffset((prev) => Math.min(prev + 1, 0));
		}

		if (key.downArrow) {
			setOffset((prev) => Math.max(prev - 1, -contentRef.current.height));
		}

		if (key.pageUp) {
			setOffset((prev) => Math.min(prev + 10, 0));
		}

		if (key.pageDown) {
			setOffset((prev) => Math.max(prev - 10, -contentRef.current.height));
		}
	});

	return (
		<Box flexDirection="column" marginTop={offset}>
			<Box ref={contentRef} flexDirection="column">
				{children}
			</Box>
		</Box>
	);
});

export default ScrollableBox;
