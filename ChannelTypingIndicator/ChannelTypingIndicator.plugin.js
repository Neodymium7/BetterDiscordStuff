/**
 * @name ChannelTypingIndicator
 * @author Neodymium
 * @version 1.0.4
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
function expectWithKey(options) {
	const [module, key] = betterdiscord.Webpack.getWithKey(options.filter, options);
	if (module) return [module, key];
	const fallback = expect(module, options);
	if (fallback) {
		const key2 = "__key";
		return [{ [key2]: fallback }, key2];
	}
	return void 0;
}

// @lib/utils/react.tsx
const EmptyComponent = (props) => null;

// modules/discordmodules.ts
const Channel = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("UNREAD_LESS_IMPORTANT"),
	name: "TypingUsersContainer"
});
const Thread = expectModule({
	filter: (m) => m?.type && betterdiscord.Webpack.Filters.byStrings("thread:", "GUILD_CHANNEL_LIST")(m.type),
	name: "Thread"
});
const TypingDots = expectModule({
	filter: (m) => m?.type?.render?.toString().includes("dotRadius"),
	name: "TypingDots",
	searchExports: true,
	fallback: EmptyComponent
});

// @lib/strings.ts
const LocaleStore = betterdiscord.Webpack.getStore("LocaleStore");
class StringsManager {
	locales;
	defaultLocale;
	strings;
	constructor(locales, defaultLocale) {
		this.locales = locales;
		this.defaultLocale = defaultLocale;
		this.strings = locales[defaultLocale];
	}
	setLocale = () => {
		this.strings = this.locales[LocaleStore.locale] || this.locales[this.defaultLocale];
	};
	subscribe() {
		this.setLocale();
		LocaleStore.addReactChangeListener(this.setLocale);
	}
	unsubscribe() {
		LocaleStore.removeReactChangeListener(this.setLocale);
	}
	get(key) {
		return this.strings[key] || this.locales[this.defaultLocale][key];
	}
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

// locales.json
const locales = {
	"en-US": {
	TYPING_LENGTH_1: "{{USER}} is typing...",
	TYPING_LENGTH_2: "{{USER1}} and {{USER2}} are typing...",
	TYPING_LENGTH_3: "{{USER1}}, {{USER2}}, and {{USER3}} are typing...",
	TYPING_LENGTH_MANY: "Several people are typing..."
}
};

// @discord/stores.ts
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const GuildMemberStore = betterdiscord.Webpack.getStore("GuildMemberStore");
const RelationshipStore = betterdiscord.Webpack.getStore("RelationshipStore");
const TypingStore = betterdiscord.Webpack.getStore("TypingStore");
const UserGuildSettingsStore = betterdiscord.Webpack.getStore("UserGuildSettingsStore");
const JoinedThreadsStore = betterdiscord.Webpack.getStore("JoinedThreadsStore");
const useStateFromStores = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("useStateFromStores"),
	name: "Flux",
	fallback(stores, callback) {
		return callback();
	},
	searchExports: true
});

// modules/utils.ts
const Strings = new StringsManager(locales, "en-US");
const getDisplayName = (userId, guildId) => {
	const { nick } = GuildMemberStore.getMember(guildId, userId);
	if (nick) return nick;
	const user = UserStore.getUser(userId);
	return user.globalName || user.username;
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
function TextChannelTypingIndicator(props) {
	const muted = useStateFromStores(
		[UserGuildSettingsStore],
		() => UserGuildSettingsStore.isChannelMuted(props.guildId, props.channelId)
	);
	if (muted) return null;
	return BdApi.React.createElement(TypingIndicator, { ...props });
}
function ThreadTypingIndicator(props) {
	const muted = useStateFromStores([JoinedThreadsStore], () => JoinedThreadsStore.isMuted(props.channelId));
	if (muted) return null;
	return BdApi.React.createElement(TypingIndicator, { ...props });
}
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
		const typingUsersElements = typingUsersIds.map((id) => BdApi.React.createElement("strong", { style: { fontWeight: 700 } }, getDisplayName(id, guildId)));
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
		if (!Channel) return;
		betterdiscord.Patcher.after(...Channel, (_, [props], ret) => {
			const target = betterdiscord.Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"]
			});
			target.children.push(
				BdApi.React.createElement(TextChannelTypingIndicator, { channelId: props.channel.id, guildId: props.channel.guild_id })
			);
		});
	}
	patchThread() {
		if (!Thread) return;
		betterdiscord.Patcher.after(Thread, "type", (_, [props], ret) => {
			const target = betterdiscord.Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"]
			});
			target.children.push(BdApi.React.createElement(ThreadTypingIndicator, { channelId: props.thread.id, guildId: props.thread.guild_id }));
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