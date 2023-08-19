import { useState } from "react";
import { Components } from "betterdiscord";
import { Component as Copy } from "../assets/copy.svg";

declare const DiscordNative: {
	clipboard: {
		copy: (item: string) => void;
	};
};

const { Tooltip } = Components;
const { copy } = DiscordNative.clipboard;

interface CodeblockProps {
	content: string;
	innerHTML: { __html: string };
}

export default function Codeblock(props: CodeblockProps) {
	const [copied, setCopied] = useState(false);
	const [forceOpen, setForceOpen] = useState(false);

	const resetCopied = () => {
		setForceOpen(false);
		setTimeout(() => setCopied(false), 50);
	};

	const copyCode = () => {
		copy(props.content);
		setCopied(true);
		setForceOpen(true);
		setTimeout(resetCopied, 1500);
	};

	return (
		<div className="codeblockWrapper" onMouseLeave={resetCopied}>
			<Tooltip
				position="top"
				text={copied ? "Copied!" : "Copy Code"}
				color={copied ? "green" : "primary"}
				forceOpen={forceOpen}
			>
				{(props) => (
					<div {...props} className="copyCodeblockButton" onClick={copyCode}>
						<Copy width="18" height="18" />
					</div>
				)}
			</Tooltip>
			<div className="codeblockContent" dangerouslySetInnerHTML={props.innerHTML || undefined}>
				{props.innerHTML ? undefined : props.content}
			</div>
		</div>
	);
}
