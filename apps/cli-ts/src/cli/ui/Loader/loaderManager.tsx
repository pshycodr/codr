import { type Instance, render } from "ink";
import React from "react";
import LiveLoader from "./LiveLoader";

let loaderInstance: Instance | null = null;
let loaderProps = {
	text: "",
	done: false,
	doneText: "",
};

export function startLoader(text = "Loading...", options = {}) {
	if (loaderInstance) return; // avoid multiple
	// @ts-ignore
	loaderProps = { text, done: false, ...options };

	loaderInstance = render(<LiveLoader {...loaderProps} />);
}

export function stopLoader(finalText = "✅ Done!") {
	if (!loaderInstance) return;

	// Update props and rerender
	loaderProps = {
		...loaderProps,
		done: true,
		doneText: finalText,
	};

	loaderInstance?.rerender(<LiveLoader {...loaderProps} />);

	// Wait a bit to show final message
	setTimeout(() => {
		loaderInstance?.unmount();
		loaderInstance = null;
	}, 1500);
}
