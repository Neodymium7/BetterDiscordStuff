/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.4.0
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
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

const betterdiscord = new BdApi("TypingUsersPopouts");

// @lib/changelog.ts
function showChangelog(changes, meta) {
	if (!changes || changes.length == 0) return;
	const changelogVersion = betterdiscord.Data.load("changelogVersion");
	if (meta.version === changelogVersion) return;
	betterdiscord.UI.showChangelogModal({
		title: meta.name,
		subtitle: meta.version,
		changes
	});
	betterdiscord.Data.save("changelogVersion", meta.version);
}

// manifest.json
const changelog = [
	{
		title: "Improved",
		type: "improved",
		items: [
			"TypingUsersPopouts no longer depends on ZeresPluginLibrary for functionality!"
		]
	},
	{
		title: "Fixed",
		type: "fixed",
		items: [
			"Fixed opening popout."
		]
	}
];

// @lib/utils/webpack.ts
function getClasses(...classes) {
	return betterdiscord.Webpack.getModule((m) => betterdiscord.Webpack.Filters.byKeys(...classes)(m) && typeof m[classes[0]] == "string");
}
function getSelectors(...classes) {
	const module = getClasses(...classes);
	if (!module) return void 0;
	return Object.keys(module).reduce((obj, key) => {
		obj[key] = "." + module[key].replaceAll(" ", ".");
		return obj;
	}, {});
}
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
function expectSelectors(name, classes) {
	return expect(getSelectors(...classes), {
		name,
		fallback: classes.reduce((obj, key) => {
			obj[key] = null;
			return obj;
		}, {})
	});
}

// modules.tsx
const {
	Filters: { byStrings, byKeys }
} = betterdiscord.Webpack;
const ErrorPopout = (props) => BdApi.React.createElement("div", { style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" } }, props.message);
const TypingUsersContainer = expectModule({
	filter: (m) => m.Z?.toString?.().includes("typingUsers:"),
	name: "TypingUsersContainer",
	fatal: true
});
const UserPopout = expectModule({
	filter: (m) => m.toString?.().includes("UserProfilePopoutWrapper"),
	name: "UserPopout",
	fallback: (_props) => BdApi.React.createElement(ErrorPopout, { message: "Error: User Popout module not found" })
});
const Common = expectModule({
	filter: byKeys("Popout"),
	name: "Common",
	fallback: {
		Popout: (props) => props.children()
	}
});
const loadProfile = expectModule({
	filter: byStrings("preloadUserBanner"),
	name: "loadProfile"
});
const typingSelector = expectSelectors("Typing Class", ["typingDots", "typing"]).typing;
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const RelationshipStore = betterdiscord.Webpack.getStore("RelationshipStore");

// index.tsx
const nameSelector = `${typingSelector} strong`;
class TypingUsersPopouts {
	meta;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
		this.patch();
	}
	patch() {
		const patchType = (props, ret) => {
			const text = betterdiscord.Utils.findInTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong", {
				walkable: ["props", "children"]
			});
			if (!text) return;
			const typingUsersIds = Object.keys(props.typingUsers).filter(
				(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
			);
			const channel = props.channel;
			const guildId = channel.guild_id;
			let i = 0;
			text.children = text.children.map((e) => {
				if (e.type !== "strong") return e;
				const user = UserStore.getUser(typingUsersIds[i++]);
				return BdApi.React.createElement(
					Common.Popout,
					{
						align: "left",
						position: "top",
						key: user.id,
						renderPopout: (props2) => BdApi.React.createElement(UserPopout, { ...props2, userId: user.id, guildId, channelId: channel.id }),
						preload: () => loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId: channel.id })
					},
					(props2) => BdApi.React.createElement("strong", { ...props2, ...e.props })
				);
			});
		};
		let patchedType;
		betterdiscord.Patcher.after(TypingUsersContainer, "Z", (_, __, containerRet) => {
			if (patchedType) {
				containerRet.type = patchedType;
				return containerRet;
			}
			const original = containerRet.type;
			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};
			containerRet.type = patchedType;
		});
	}
	stop() {
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
	}
}

module.exports = TypingUsersPopouts;

/*@end@*/