/**
 * @name CopyCodeblocks
 * @author Neodymium
 * @description Adds a simple copy button to codeblocks.
 * @version 1.2.1
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/CopyCodeblocks/CopyCodeblocks.plugin.js
 * @donate https://ko-fi.com/neodymium7
 * @invite fRbsqH87Av
 */

/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

'use strict';

var betterdiscord = new BdApi("CopyCodeblocks");
var react = BdApi.React;
var meta = {
	name: "CopyCodeblocks",
	author: "Neodymium",
	description: "Adds a simple copy button to codeblocks.",
	version: "1.2.1",
	source: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/CopyCodeblocks/CopyCodeblocks.plugin.js",
	donate: "https://ko-fi.com/neodymium7",
	invite: "fRbsqH87Av"
};

// bundlebd
var Logger = class {
	static _log(type, message) {
		console[type](`%c[${meta.name}]`, "color: #3a71c1; font-weight: 700;", message);
	}
	static log(message) {
		this._log("log", message);
	}
	static warn(message) {
		this._log("warn", message);
	}
	static error(message) {
		this._log("error", message);
	}
};
var WebpackUtils = class {
	static getStore(name) {
		return betterdiscord.Webpack.getModule((m) => m._dispatchToken && m.getName() === name);
	}
	static getModuleWithKey(filter) {
		let target;
		let id;
		let key;
		betterdiscord.Webpack.getModule(
			(e, m, i) => {
				if (filter(e, m, i)) {
					target = m;
					id = i;
					return true;
				}
				return false;
			},
			{ searchExports: true }
		);
		for (const k in target.exports) {
			if (filter(target.exports[k], target, id)) {
				key = k;
				break;
			}
		}
		return [target.exports, key];
	}
	static expectModule(filterOrOptions, options) {
		let filter;
		if (typeof filterOrOptions === "function") {
			filter = filterOrOptions;
		} else {
			filter = filterOrOptions.filter;
			options = filterOrOptions;
		}
		const found = betterdiscord.Webpack.getModule(filter, options);
		if (found) return found;
		const name = options.name ? `'${options.name}'` : `query with filter '${filter.toString()}'`;
		const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
		const errorMessage = `Module ${name} not found.${fallbackMessage}

Contact the plugin developer to inform them of this error.`;
		Logger.error(errorMessage);
		options.onError?.();
		if (options.fatal) throw new Error(errorMessage);
		return options.fallback;
	}
	static getClasses(name, classes) {
		return WebpackUtils.expectModule({
			filter: betterdiscord.Webpack.Filters.byProps(...classes),
			name,
			fallback: classes.reduce((obj, key) => {
				obj[key] = "unknown-class";
				return obj;
			}, {})
		});
	}
	static getSelectors(name, classes) {
		const module = WebpackUtils.expectModule({
			filter: betterdiscord.Webpack.Filters.byProps(...classes),
			name,
			fallback: {}
		});
		if (Object.keys(module).length === 0)
			return classes.reduce((obj, key) => {
				obj[key] = null;
				return obj;
			}, {});
		return Object.keys(module).reduce((obj, key) => {
			obj[key] = `.${module[key].replaceAll(" ", ".")}`;
			return obj;
		}, {});
	}
	static store(name) {
		return (m) => m._dispatchToken && m.getName() === name;
	}
	static byId(id) {
		return (_e, _m, i) => i === id;
	}
	static byValues(...filters) {
		return (e, m, i) => {
			let match = true;
			for (const filter of filters) {
				if (!Object.values(e).some((v) => filter(v, m, i))) {
					match = false;
					break;
				}
			}
			return match;
		};
	}
};

// assets/copy.svg
const SvgCopy = (props) => BdApi.React.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	...props
}, BdApi.React.createElement("path", {
	d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z",
	fill: "currentColor"
}), BdApi.React.createElement("path", {
	d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z",
	fill: "currentColor"
}));

// components/Codeblock.tsx
const { Tooltip } = betterdiscord.Components;
const { copy } = DiscordNative.clipboard;
function Codeblock(props) {
	const [copied, setCopied] = react.useState(false);
	const [forceOpen, setForceOpen] = react.useState(false);
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
	return BdApi.React.createElement("div", {
		className: "codeblockWrapper",
		onMouseLeave: resetCopied
	}, BdApi.React.createElement(Tooltip, {
		position: "top",
		text: copied ? "Copied!" : "Copy Code",
		color: copied ? "green" : "primary",
		forceOpen
	}, (props2) => BdApi.React.createElement("div", {
		...props2,
		className: "copyCodeblockButton",
		onClick: copyCode
	}, BdApi.React.createElement(SvgCopy, {
		width: "18",
		height: "18"
	}))), BdApi.React.createElement("div", {
		className: "codeblockContent",
		dangerouslySetInnerHTML: props.innerHTML || void 0
	}, props.innerHTML ? void 0 : props.content));
}

// styles.css
var css = ".codeblockWrapper {\n\tposition: relative;\n\tmargin: -7px;\n}\n\n.codeblockContent {\n\tpadding: 7px;\n}\n\n.copyCodeblockButton {\n\tposition: absolute;\n\tright: 3px;\n\ttop: 3px;\n\theight: 18px;\n\twidth: 18px;\n\tpadding: 2px;\n\tbackground-color: var(--background-tertiary);\n\tcolor: var(--interactive-normal);\n\tbox-shadow: var(--elevation-medium);\n\tborder: 1px solid var(--background-floating);\n\tborder-radius: 4px;\n\tcursor: pointer;\n\topacity: 1;\n\ttransition: opacity 0.1s, transform 0.1s;\n\ttransform: none;\n}\n\n.copyCodeblockButton:hover {\n\tcolor: var(--interactive-hover);\n}\n\n.copyCodeblockButton:active {\n\tcolor: var(--interactive-active);\n}\n\n.codeblockWrapper:not(:hover) .copyCodeblockButton {\n\topacity: 0;\n\ttransform: scale(0.95) translate(2px, -2px);\n}\n";

// index.tsx
const {
	Filters: { byProps }
} = betterdiscord.Webpack;
const { expectModule } = WebpackUtils;
const Parser = expectModule(byProps("parseTopic"), { name: "Parser" });
class CopyCodeblocks {
	start() {
		betterdiscord.DOM.addStyle(css);
		betterdiscord.Patcher.after(Parser.defaultRules.codeBlock, "react", (_, [{ content }], ret) => {
			const render = ret.props.children.props.render;
			ret.props.children.props.render = (renderProps) => {
				const codeblock = render(renderProps);
				const innerHTML = codeblock.props.dangerouslySetInnerHTML;
				delete codeblock.props.dangerouslySetInnerHTML;
				codeblock.props.children = BdApi.React.createElement(Codeblock, {
					content,
					innerHTML
				});
				return codeblock;
			};
		});
	}
	stop() {
		betterdiscord.Patcher.unpatchAll();
		betterdiscord.DOM.removeStyle();
	}
}

module.exports = CopyCodeblocks;

/*@end@*/