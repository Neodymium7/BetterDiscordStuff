/**
 * @name ClickableTextMentions
 * @author Neodymium
 * @version 1.0.4
 * @description Makes mentions in the message text area clickable.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ClickableTextMentions/ClickableTextMentions.plugin.js
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

const betterdiscord = new BdApi("ClickableTextMentions");
const fs = require('fs');
const path = require('path');

// @lib/utils/webpack.ts
function getClasses(...classes) {
	return betterdiscord.Webpack.getModule((m) => betterdiscord.Webpack.Filters.byKeys(...classes)(m) && typeof m[classes[0]] == "string");
}
function expect(object, options) {
	if (object) return object;
	const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
	const errorMessage = `Module ${options.name} not found.${fallbackMessage}\n\nContact the plugin developer to inform them of this error.`;
	betterdiscord.Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);
	return options.fallback;
}
function expectModule(options) {
	return expect(betterdiscord.Webpack.getModule(options.filter, options), options);
}
function byType(type) {
	return (e) => typeof e === type;
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

// @discord/stores.ts
const UserStore = betterdiscord.Webpack.getStore("UserStore");

// @lib/utils/react.tsx
const EmptyWrapperComponent = (props) => BdApi.React.createElement("span", { ...props });
const ErrorPopout = (props) => BdApi.React.createElement("div", { style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" } }, "Error: Popout component not found");

// @discord/components.tsx
const Popout = expectModule({
	filter: (m) => m.defaultProps && m.Animation?.TRANSLATE,
	name: "Popout",
	fallback: EmptyWrapperComponent,
	searchExports: true
});
const UserPopout = expectModule({
	filter: (m) => m.toString?.().includes("UserProfilePopoutWrapper"),
	name: "UserPopout",
	fallback: ErrorPopout
});

// @discord/modules.ts
const loadProfile = expectModule({
	filter: betterdiscord.Webpack.Filters.combine(
		betterdiscord.Webpack.Filters.byStrings("preloadUser"),
		byType("function")
	),
	name: "loadProfile"
});

// index.tsx
const {
	getWithKey,
	Filters: { byStrings }
} = betterdiscord.Webpack;
const [Module, key] = getWithKey(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"));
if (!Module) betterdiscord.Logger.error("Text area mention module not found.");
const onClick = (e) => {
	e.preventDefault();
};
function PopoutWrapper({ id, guildId, channelId, children }) {
	children.props.onClick = onClick;
	const user = UserStore.getUser(id);
	return BdApi.React.createElement(
		Popout,
		{
			align: "left",
			position: "top",
			key: user.id,
			renderPopout: (props) => BdApi.React.createElement(UserPopout, { ...props, userId: user.id, guildId, channelId }),
			preload: () => loadProfile?.(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })
		},
		(props) => BdApi.React.createElement("span", { ...props }, children)
	);
}
class ClickableTextMentions {
	meta;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		Updater.checkForUpdates(this.meta);
		this.patch();
	}
	patch() {
		if (!Module) return;
		betterdiscord.Patcher.after(Module, key, (_, [props], ret) => {
			const original = ret.props.children;
			ret.props.children = (childrenProps) => {
				const mention = original(childrenProps).props.children;
				return BdApi.React.createElement(PopoutWrapper, { ...props }, mention);
			};
		});
	}
	stop() {
		betterdiscord.Patcher.unpatchAll();
		Updater.closeNotice();
	}
}

module.exports = ClickableTextMentions;

/*@end@*/