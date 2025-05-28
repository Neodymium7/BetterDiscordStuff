/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.4.7
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
const react = BdApi.React;

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
function expectSelectors(name, classes) {
	return expect(getSelectors(...classes), {
		name
	});
}
function byType(type) {
	return (e) => typeof e === type;
}

// manifest.json
const changelog = [
	{
		title: "Fixed",
		type: "fixed",
		items: [
			"Fixed popout click behavior."
		]
	}
];

// modules.tsx
const TypingUsersContainer = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("typingUsers:"),
	name: "TypingUsersContainer",
	fatal: true
});
const typingSelector = expectSelectors("Typing Class", ["typingDots", "typing"])?.typing;

// @discord/stores.ts
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const RelationshipStore = betterdiscord.Webpack.getStore("RelationshipStore");

// @lib/utils/react.tsx
const EmptyWrapperComponent = (props) => BdApi.React.createElement("span", { ...props });
const ErrorPopout = (props) => BdApi.React.createElement("div", { style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" } }, "Error: Popout component not found");

// @discord/components.tsx
const Popout = expectModule({
	filter: (m) => m.Animation && m.prototype.render,
	name: "Popout",
	fallback: EmptyWrapperComponent,
	searchExports: true
});
const UserPopout = expectModule({
	filter: betterdiscord.Webpack.Filters.combine(
		betterdiscord.Webpack.Filters.byStrings("isNonUserBot", "onHide"),
		(m) => !m.toString?.().includes("Sidebar")
	),
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

// @lib/components.tsx
function UserPopoutWrapper({ id, guildId, channelId, children }) {
	const ref = react.useRef(null);
	const user = UserStore.getUser(id);
	return BdApi.React.createElement(
		Popout,
		{
			align: "left",
			position: "top",
			clickTrap: true,
			renderPopout: (props) => BdApi.React.createElement(
				UserPopout,
				{
					...props,
					currentUser: UserStore.getCurrentUser(),
					user,
					guildId,
					channelId
				}
			),
			preload: () => loadProfile?.(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId }),
			targetElementRef: ref
		},
		(props) => BdApi.React.createElement("span", { ref, ...props }, children)
	);
}

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
		if (!TypingUsersContainer) return;
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
				return BdApi.React.createElement(UserPopoutWrapper, { id: user.id, guildId, channelId: channel.id }, e);
			});
		};
		let patchedType;
		betterdiscord.Patcher.after(...TypingUsersContainer, (_, __, containerRet) => {
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