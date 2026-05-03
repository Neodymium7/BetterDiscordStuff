/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 2.0.6
 * @description Displays an icon on and optionally adds a background to pinned messages.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
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

const betterdiscord = new BdApi("PinnedMessageIcons");
const fs = require('fs');
const path = require('path');

// @lib/utils/webpack.ts
function getClasses(...classes) {
	return betterdiscord.Webpack.getModule((m) => betterdiscord.Webpack.Filters.byKeys(...classes)(m) && typeof m[classes[0]] == "string");
}
function getSelectors(...classes) {
	const module = getClasses(...classes);
	if (!module) return void 0;
	return classes.reduce((obj, className) => {
		obj[className] = "." + module[className].replaceAll(" ", ".");
		return obj;
	}, {});
}
function getIcon(searchString) {
	const filter = (m) => betterdiscord.Webpack.Filters.byStrings(searchString, '"svg"')(m) && typeof m === "function";
	return betterdiscord.Webpack.getModule(filter, {
		searchExports: true
	});
}
async function waitForModuleWithKey(filter, options) {
	return betterdiscord.Webpack.getWithKey(filter, {
		target: await betterdiscord.Webpack.waitForModule((m) => Object.values(m).some(filter), options)
	});
}

// @lib/updater.ts
const hoverClass = getClasses("anchorUnderlineOnHover")?.anchorUnderlineOnHover || "";
const findVersion = (pluginContents) => {
	const lines = pluginContents.split("\n");
	const versionLine = lines.find((line) => line.includes("@version"));
	return versionLine.split(/\s+/).pop();
};
const updatePlugin = (name, newContents) => {
	const path$1 = path.join(betterdiscord.Plugins.folder, name + ".plugin.js");
	fs.writeFileSync(path$1, newContents);
};
const showUpdateNotice = (name, version, newContents) => {
	const noticeElementHTML = `<span><a href="https://github.com/Neodymium7/BetterDiscordStuff/blob/main/${name}/${name}.plugin.js" target="_blank" class="${hoverClass}" style="color: #fff; font-weight: 700;">${name} v${version}</a> is available</span>`;
	const noticeElement = betterdiscord.DOM.parseHTML(noticeElementHTML);
	betterdiscord.UI.createTooltip(noticeElement.firstChild, "View Source", { side: "bottom" });
	return betterdiscord.UI.showNotice(noticeElement, {
		buttons: [
			{
				label: "Update",
				onClick: () => updatePlugin(name, newContents)
			}
		]
	});
};
const Updater = {
	closeUpdateNotice: void 0,
	async checkForUpdates(meta) {
		const url = `https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/${meta.name}/${meta.name}.plugin.js`;
		const res = await betterdiscord.Net.fetch(url);
		if (!res.ok) {
			betterdiscord.Logger.error(`Failed to check for updates: ${res.status} - ${res.statusText}`);
			return;
		}
		const text = await res.text();
		const version = findVersion(text);
		if (version === meta.version) return;
		this.closeUpdateNotice = showUpdateNotice(meta.name, version, text);
	},
	closeNotice() {
		if (this.closeUpdateNotice) this.closeUpdateNotice();
	}
};

// index.tsx
const Pin = getIcon("M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5");
if (!Pin) betterdiscord.Logger.error("Pin icon not found.");
class PinnedMessageIcons {
	settings;
	meta;
	modules = {};
	modulesLoaded = false;
	constructor(meta) {
		this.meta = meta;
	}
	async getModules() {
		if (this.modulesLoaded) return;
		this.modules.Message = [
			...await waitForModuleWithKey(
				betterdiscord.Webpack.Filters.byStrings("childrenRepliedMessage", "focusProps")
			)
		];
		const [module] = this.modules.Message;
		if (!module) return betterdiscord.Logger.error("Message module not found");
		this.modules.messageSelectors = getSelectors("message", "mentioned", "replying");
		if (!this.modules.messageSelectors) betterdiscord.Logger.error("Message selectors module not found.");
		this.modulesLoaded = true;
	}
	async start() {
		Updater.checkForUpdates(this.meta);
		this.settings = betterdiscord.Data.load("settings");
		if (!this.settings) {
			this.settings = { backgroundEnabled: true };
			betterdiscord.Data.save("settings", this.settings);
		}
		await this.getModules();
		this.addStyle();
		this.patch();
	}
	patch() {
		betterdiscord.Patcher.after(...this.modules.Message, (_, [props], ret) => {
			const message = betterdiscord.Utils.findInTree(props.childrenMessageContent, (x) => x.author && x.content, {
				walkable: ["props", "children", "message"]
			});
			if (!message) return ret;
			if (props["data-list-item-id"].includes("pin")) return ret;
			if (!message.pinned) return ret;
			const messageNode = betterdiscord.Utils.findInTree(ret, (e) => Array.isArray(e?.props?.children) && e?.props?.className, {
				walkable: ["props", "children"]
			});
			if (!messageNode) return ret;
			messageNode.props.className += " pinned-message";
			if (!Pin) return ret;
			messageNode.props.children.push(
				BdApi.React.createElement(
					Pin,
					{
						className: "pinned-message-icon",
						color: "var(--interactive-text-default)",
						size: "20px",
						width: "20px",
						height: "20px"
					}
				)
			);
		});
	}
	addStyle() {
		let style = ":root .pinned-message { padding-right: calc(var(--space-xl) + 36px) !important } .pinned-message-icon { position: absolute; bottom: calc(50% - 10px); right: 24px; }";
		if (this.modules.messageSelectors && this.settings.backgroundEnabled) {
			const selector = `${this.modules.messageSelectors.message}.pinned-message:not(${this.modules.messageSelectors.mentioned}):not(${this.modules.messageSelectors.replying})`;
			style += `${selector}::after { content: ""; position: absolute; display: block; width: inherit; height: inherit; left: 0px; bottom: 0px; right: 0px; top: 0px; background: var(--channels-default); opacity: 0.08; z-index: -1; border-radius: 4px; } ${selector}::before { content: ""; position: absolute; display: block; width: 2px; height: inherit; left: 0px; bottom: 0px; top: 0px; background: var(--channels-default); }`;
		}
		betterdiscord.DOM.addStyle(style);
	}
	stop() {
		betterdiscord.Patcher.unpatchAll();
		betterdiscord.DOM.removeStyle();
		Updater.closeNotice();
	}
	getSettingsPanel() {
		return betterdiscord.UI.buildSettingsPanel({
			settings: [
				{
					type: "switch",
					id: "backgroundEnabled",
					name: "Pinned Message Background",
					note: "Adds a white background to pinned messages",
					value: this.settings.backgroundEnabled
				}
			],
			onChange: (_, _id, value) => {
				this.settings.backgroundEnabled = value;
				betterdiscord.DOM.removeStyle();
				this.addStyle();
				betterdiscord.Data.save("settings", this.settings);
			}
		});
	}
}

module.exports = PinnedMessageIcons;

/*@end@*/