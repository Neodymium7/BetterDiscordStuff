/**
 * @name CopyCodeblocks
 * @author Neodymium
 * @version 1.0.3
 * @description Adds a copy button to codeblocks.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/CopyCodeblocks/CopyCodeblocks.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/CopyCodeblocks/CopyCodeblocks.plugin.js
 * @invite fRbsqH87Av
 */

const { TooltipContainer } = BdApi.findModuleByProps("TooltipContainer");
const Copy = BdApi.findModuleByDisplayName("Copy");
const copy = BdApi.findModuleByProps("requireModule").copy;
const { React } = BdApi;

function Codeblock(props) {
	const [copied, setCopied] = React.useState(false);
	const [forceOpen, setForceOpen] = React.useState(false);

	const resetCopied = () => {
		setForceOpen(false);
		setTimeout(() => setCopied(false), 50);
	};

	const copyCode = () => {
		copy(props.content);
		setCopied(true);
		setForceOpen(true);
		setTimeout(resetCopied, 1000);
	};

	return React.createElement(
		"div",
		{ className: "codeblockWrapper", onMouseLeave: resetCopied },
		React.createElement(
			TooltipContainer,
			{
				position: "top",
				text: copied ? "Copied!" : "Copy Code",
				color: copied ? "green" : "primary",
				forceOpen: forceOpen,
				className: "copyCodeblockButtonWrapper"
			},
			React.createElement("div", { className: "copyCodeblockButton", onClick: copyCode }, React.createElement(Copy, { width: "18", height: "18" }))
		),
		props.innerHTML
			? React.createElement("div", { className: "codeblockContent", dangerouslySetInnerHTML: props.innerHTML })
			: React.createElement("div", { className: "codeblockContent" }, props.content)
	);
}

module.exports = class CopyCodeblocks {
	start() {
		BdApi.injectCSS(
			"CopyCodeblocks",
			`
            .codeblockWrapper {
                position: relative;
                margin: -7px;
            }
            .codeblockContent {
                padding: 7px
			}
            .copyCodeblockButtonWrapper {
                background-color: var(--background-tertiary);
                position: absolute;
                right: 3px;
                top: 3px;
                height: 24px;
                width: 24px;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid var(--background-floating);
                box-shadow: var(--elevation-medium);
            }
            .copyCodeblockButton {
                position: relative;
                bottom: 1px;
                right: 1px;
                height: 18px;
                width: 18px;
                padding: 4px;
                color: var(--interactive-normal);
            }
            .copyCodeblockButton:hover {
                color: var(--interactive-hover);
            }
            .copyCodeblockButton:active {
                color: var(--interactive-active);
            }
            .codeblockWrapper:not(:hover) .copyCodeblockButtonWrapper {
                display: none;
            }
        `
		);
		const Parser = BdApi.findModuleByProps("parseTopic");
		BdApi.Patcher.after("CopyCodeblocks", Parser.defaultRules.codeBlock, "react", (_, [{ content }], ret) => {
			const render = ret.props.render;
			ret.props.render = renderProps => {
				const codeblock = render(renderProps);
				const innerHTML = codeblock.props.children.props.dangerouslySetInnerHTML;
				delete codeblock.props.children.props.dangerouslySetInnerHTML;
				codeblock.props.children.props.children = React.createElement(Codeblock, { content: content, innerHTML: innerHTML });
				return codeblock;
			};
		});
	}

	stop() {
		BdApi.Patcher.unpatchAll("CopyCodeblocks");
		BdApi.clearCSS("CopyCodeblocks");
	}
};
