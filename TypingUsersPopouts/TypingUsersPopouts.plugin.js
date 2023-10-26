/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.3.3
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
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

const config = {
	info: {
		name: "TypingUsersPopouts",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.3.3",
		description: "Opens the user's popout when clicking on a name in the typing area.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js"
	},
	changelog: [
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed issues with the newest Discord update."
			]
		}
	]
};

if (!global.ZeresPluginLibrary) {
	BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
		confirmText: "Download Now",
		cancelText: "Cancel",
		onConfirm: () => {
			require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
				if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
				await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
			});
		}
	});
}

function buildPlugin([BasePlugin, Library]) {
	const Plugin = (function (betterdiscord, Plugin) {
		'use strict';
	
		// meta
		const name = "TypingUsersPopouts";
	
		// @lib/logger.ts
		class Logger {
			static _log(type, message) {
				console[type](`%c[${name}]`, "color: #3a71c1; font-weight: 700;", message);
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
		}
	
		// @lib/utils/webpack.ts
		function getStore(name) {
			return betterdiscord.Webpack.getModule((m) => m._dispatchToken && m.getName() === name);
		}
		function expectModule(filterOrOptions, options) {
			let filter;
			if (typeof filterOrOptions === "function") {
				filter = filterOrOptions;
			} else {
				filter = filterOrOptions.filter;
				options = filterOrOptions;
			}
			const found = betterdiscord.Webpack.getModule(filter, options);
			if (found)
				return found;
			const name = options.name ? `'${options.name}'` : `query with filter '${filter.toString()}'`;
			const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
			const errorMessage = `Module ${name} not found.${fallbackMessage}
	
	Contact the plugin developer to inform them of this error.`;
			Logger.error(errorMessage);
			options.onError?.();
			if (options.fatal)
				throw new Error(errorMessage);
			return options.fallback;
		}
		function getSelectors(name, classes) {
			const module = expectModule({
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
	
		// modules.tsx
		const {
			Filters: { byStrings, byProps }
		} = betterdiscord.Webpack;
		const ErrorPopout = (props) => BdApi.React.createElement("div", {
			style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }
		}, props.message);
		const TypingUsersContainer = expectModule({
			filter: (m) => m.default?.toString?.().includes("typingUsers:"),
			name: "TypingUsersContainer",
			fatal: true
		});
		const UserPopout = expectModule({
			filter: (m) => m.type?.toString?.().includes('"Unexpected missing user"'),
			name: "UserPopout",
			fallback: (_props) => BdApi.React.createElement(ErrorPopout, {
				message: "Error: User Popout module not found"
			})
		});
		const Common = expectModule({
			filter: byProps("Popout"),
			name: "Common",
			fallback: {
				Popout: (props) => props.children()
			}
		});
		const loadProfile = expectModule({
			filter: byStrings("preloadUserBanner"),
			name: "loadProfile"
		});
		const typingSelector = getSelectors("Typing Class", ["typingDots", "typing"]).typing;
		const UserStore = getStore("UserStore");
		const RelationshipStore = getStore("RelationshipStore");
	
		// index.tsx
		const findChildComponent = async (module, functionName, filter) => {
			return new Promise((resolve, reject) => {
				const unpatch = betterdiscord.Patcher.after(module, functionName, (_, __, ret) => {
					const found = betterdiscord.Utils.findInTree(ret, (i) => filter(i));
					found ? resolve(found) : reject("No item found matching filter");
					unpatch();
				});
			});
		};
		const nameSelector = `${typingSelector} strong`;
		class TypingUsersPopouts extends Plugin {
			onStart() {
				betterdiscord.DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
				this.patch();
			}
			async patch() {
				const TypingUsers = await findChildComponent(TypingUsersContainer, "default", (i) => i.prototype?.render);
				betterdiscord.Patcher.after(TypingUsers.prototype, "render", (that, _, ret) => {
					const text = betterdiscord.Utils.findInTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong", {
						walkable: ["props", "children"]
					});
					if (!text)
						return ret;
					const typingUsersIds = Object.keys(that.props.typingUsers).filter(
						(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
					);
					const channel = that.props.channel;
					const guildId = channel.guild_id;
					let i = 0;
					text.children = text.children.map((e) => {
						if (e.type !== "strong")
							return e;
						const user = UserStore.getUser(typingUsersIds[i++]);
						return BdApi.React.createElement(Common.Popout, {
							align: "left",
							position: "top",
							key: user.id,
							renderPopout: () => BdApi.React.createElement(UserPopout, {
								userId: user.id,
								guildId,
								channelId: channel.id
							}),
							preload: () => loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId: channel.id })
						}, (props) => BdApi.React.createElement("strong", {
							...props,
							...e.props
						}));
					});
				});
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				betterdiscord.Patcher.unpatchAll();
			}
		}
	
		return TypingUsersPopouts;
	
	})(new BdApi("TypingUsersPopouts"), BasePlugin);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/