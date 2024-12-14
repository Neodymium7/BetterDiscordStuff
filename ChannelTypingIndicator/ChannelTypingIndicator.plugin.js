/**
 * @name ChannelTypingIndicator
 * @author Neodymium
 * @version 1.0.1
 * @description Adds an indicator to server channels when users are typing.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ChannelTypingIndicator/ChannelTypingIndicator.plugin.js
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

const betterdiscord = new BdApi("ChannelTypingIndicator");
const fs = require('fs');
const path = require('path');

// @lib/utils/webpack.ts
function expect(object, options) {
	if (object) return object;
	const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
	const errorMessage = `Module ${options.name} not found.${fallbackMessage}

Contact the plugin developer to inform them of this error.`;
	betterdiscord.Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);
	return options.fallback;
}
function expectModule(options) {
	return expect(betterdiscord.Webpack.getModule(options.filter, options), options);
}

// modules/discordmodules.ts
const {
	Filters: { byStrings }
} = betterdiscord.Webpack;
const Channel = expectModule({
	filter: byStrings("UNREAD_LESS_IMPORTANT"),
	name: "TypingUsersContainer",
	defaultExport: false
});
const Thread = expectModule({
	filter: (m) => m?.type && byStrings("thread:", "GUILD_CHANNEL_LIST")(m.type),
	name: "Thread"
});
const TypingDots = expectModule({
	filter: (m) => m?.type?.render?.toString().includes("dotRadius"),
	name: "TypingDots",
	searchExports: true,
	fatal: true
});
const useStateFromStores = expectModule({
	filter: byStrings("useStateFromStores"),
	name: "Flux",
	searchExports: true,
	fatal: true
});
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const GuildMemberStore = betterdiscord.Webpack.getStore("GuildMemberStore");
const RelationshipStore = betterdiscord.Webpack.getStore("RelationshipStore");
const TypingStore = betterdiscord.Webpack.getStore("TypingStore");

// @lib/strings.ts
const LocaleStore = betterdiscord.Webpack.getStore("LocaleStore");
class StringsManager {
	locales;
	defaultLocale;
	strings;
	/**
	 * Creates a `StringsManager` object with the given locales object.
	 * @param locales An object containing the strings for each locale.
	 * @param defaultLocale The code of the locale to use as a fallback when strings for Discord's selected locale are not defined.
	 * @returns A `StringsManager` object.
	 */
	constructor(locales, defaultLocale) {
		this.locales = locales;
		this.defaultLocale = defaultLocale;
		this.strings = locales[defaultLocale];
	}
	setLocale = () => {
		this.strings = this.locales[LocaleStore.locale] || this.locales[this.defaultLocale];
	};
	/**
	 * Subscribes to Discord's locale changes. Should be run on plugin start.
	 */
	subscribe() {
		this.setLocale();
		LocaleStore.addReactChangeListener(this.setLocale);
	}
	/**
	 * Unsubscribes from Discord's locale changes. Should be run on plugin stop.
	 */
	unsubscribe() {
		LocaleStore.removeReactChangeListener(this.setLocale);
	}
	/**
	 * Gets the string for the corresponding key in Discord's currently selected locale.
	 * @param key The string key.
	 * @returns A localized string.
	 */
	get(key) {
		return this.strings[key] || this.locales[this.defaultLocale][key];
	}
}

// locales.json
const locales = {
	"en-US": {
	TYPING_LENGTH_1: "{{USER}} is typing...",
	TYPING_LENGTH_2: "{{USER1}} and {{USER2}} are typing...",
	TYPING_LENGTH_3: "{{USER1}}, {{USER2}}, and {{USER3}} are typing...",
	TYPING_LENGTH_MANY: "Several people are typing..."
}
};

// modules/utils.ts
const Strings = new StringsManager(locales, "en-US");
const getDisplayName = (userId, guildId) => {
	const { nick } = GuildMemberStore.getMember(guildId, userId);
	if (nick) return nick;
	return UserStore.getUser(userId).globalName;
};

// @lib/utils/string.ts
function parseStringReact(string, parseObject) {
	const delimiters = ["{{", "}}"];
	const splitRegex = new RegExp(`(${delimiters[0]}.+?${delimiters[1]})`, "g");
	const itemRegex = new RegExp(delimiters[0] + "(.+)" + delimiters[1]);
	const parts = string.split(splitRegex).filter(Boolean);
	return parts.map((part) => {
		if (!itemRegex.test(part)) return part;
		const key = part.replace(itemRegex, "$1");
		return parseObject[key] ?? part;
	});
}

// TypingIndicator.tsx
function TypingIndicator({ channelId, guildId }) {
	const typingUsersState = useStateFromStores([TypingStore], () => TypingStore.getTypingUsers(channelId));
	const typingUsersIds = Object.keys(typingUsersState).filter(
		(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
	);
	if (!typingUsersIds.length) return null;
	let tooltip;
	if (typingUsersIds.length > 3) {
		tooltip = Strings.get("TYPING_LENGTH_MANY");
	} else {
		const typingUsersElements = typingUsersIds.map((id) => BdApi.React.createElement("strong", null, getDisplayName(id, guildId)));
		if (typingUsersElements.length == 1) {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_1"), { USER: typingUsersElements[0] });
		} else if (typingUsersElements.length == 2) {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_2"), {
				USER1: typingUsersElements[0],
				USER2: typingUsersElements[1]
			});
		} else {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_3"), {
				USER1: typingUsersElements[0],
				USER2: typingUsersElements[1],
				USER3: typingUsersElements[2]
			});
		}
	}
	return BdApi.React.createElement(betterdiscord.Components.Tooltip, { text: tooltip, position: "top" }, (props) => BdApi.React.createElement("div", { ...props, className: "channelTypingIndicator" }, BdApi.React.createElement(TypingDots, { dotRadius: 3.5, themed: true })));
}

// @lib/updater.tsx
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
	const noticeElement = document.createElement("span");
	const linkElementStyle = "color: #fff; font-weight: 700;";
	const linkElementHTML = `<a href="https://github.com/Neodymium7/BetterDiscordStuff/blob/main/${name}/${name}.plugin.js" target="_blank" style="${linkElementStyle}">${name} v${version}</a>`;
	const linkElement = betterdiscord.DOM.parseHTML(linkElementHTML);
	const setStyle = (style) => linkElement.setAttribute("style", style);
	linkElement.addEventListener("mouseenter", () => setStyle(linkElementStyle + " text-decoration: underline;"));
	linkElement.addEventListener("mouseleave", () => setStyle(linkElementStyle));
	betterdiscord.UI.createTooltip(linkElement, "View Source", { side: "bottom" });
	noticeElement.appendChild(linkElement);
	noticeElement.appendChild(document.createTextNode(" is available"));
	const closeNotice = betterdiscord.UI.showNotice(noticeElement, {
		buttons: [
			{
				label: "Update",
				onClick: () => {
					updatePlugin(name, newContents);
					closeNotice();
				}
			}
		]
	});
	return closeNotice;
};
const Updater = {
	async checkForUpdates(meta) {
		const url = `https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/${meta.name}/${meta.name}.plugin.js`;
		const res = await betterdiscord.Net.fetch(url);
		if (!res.ok) {
			betterdiscord.Logger.error(`Failed to check for updates: ${res.status} - ${res.statusText}`);
			return;
		}
		const text = await res.text();
		const version = findVersion(text);
		if (version <= meta.version) return;
		this.closeUpdateNotice = showUpdateNotice(meta.name, version, text);
	},
	closeNotice() {
		if (this.closeUpdateNotice) this.closeUpdateNotice();
	}
};

// index.tsx
class ChannelTypingIndicator {
	meta;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		Updater.checkForUpdates(this.meta);
		Strings.subscribe();
		betterdiscord.DOM.addStyle(".channelTypingIndicator { margin-left: 8px; display: flex; align-items: center; }");
		this.patchChannel();
		this.patchThread();
	}
	patchChannel() {
		betterdiscord.Patcher.after(Channel, "Z", (_, [props], ret) => {
			const target = betterdiscord.Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"]
			});
			target.children.push(BdApi.React.createElement(TypingIndicator, { channelId: props.channel.id, guildId: props.channel.guild_id }));
		});
	}
	patchThread() {
		betterdiscord.Patcher.after(Thread, "type", (_, [props], ret) => {
			const target = betterdiscord.Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"]
			});
			target.children.push(BdApi.React.createElement(TypingIndicator, { channelId: props.thread.id, guildId: props.thread.guild_id }));
		});
	}
	stop() {
		Strings.unsubscribe();
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
		Updater.closeNotice();
	}
}

module.exports = ChannelTypingIndicator;

/*@end@*/