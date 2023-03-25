/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @version 1.3.0
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
		version: "1.3.0",
		description: "Opens the user's popout when clicking on a name in the typing area.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js"
	},
	changelog: [
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed profile loading.",
				"The plugin should now be much more resilient to errors and updates."
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
    var Plugin = (function (betterdiscord, zlibrary, react, meta, Plugin) {
		'use strict';
	
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
		var WebpackUtils = {
			store(name) {
				return (m) => m._dispatchToken && m.getName() === name;
			},
			byId(id) {
				return (_e, _m, i) => i === id;
			},
			byValues(...filters) {
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
			},
			getModuleWithKey(filter) {
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
			},
			expectModule(filter, options) {
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
		};
	
		// modules.tsx
		const {
			Filters: { byStrings: byStrings$1 },
			getModule
		} = betterdiscord.Webpack;
		const { expectModule, store } = WebpackUtils;
		const Error$1 = (props) => BdApi.React.createElement("div", {
			style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }
		}, props.message);
		const UserPopout = expectModule((e) => e.type?.toString().includes('"userId"'), {
			name: "UserPopout",
			fallback: (_props) => BdApi.React.createElement(Error$1, {
				message: "Error: User Popout module not found"
			})
		});
		const Popout = expectModule(byStrings$1(".animationPosition"), {
			searchExports: true,
			name: "Popout",
			fallback: (props) => props.children()
		});
		const loadProfile = expectModule(
			(m) => m.Z?.toString?.().includes("y.apply(this,arguments)") && Object.values(m).length === 1,
			{ name: "loadProfile" }
		).Z;
		const UserStore = getModule(store("UserStore"));
		const RelationshipStore = getModule(store("RelationshipStore"));
	
		// index.tsx
		const {
			Filters: { byStrings }
		} = betterdiscord.Webpack;
		const { getModuleWithKey } = WebpackUtils;
		const findChildComponent = async (module, functionName, filter) => {
			return new Promise((resolve, reject) => {
				const unpatch = betterdiscord.Patcher.after(module, functionName, (_, __, ret) => {
					const found = betterdiscord.Utils.findInTree(ret, (i) => filter(i));
					found ? resolve(found) : reject("No item found matching filter");
					unpatch();
				});
			});
		};
		const nameSelector = `${zlibrary.DiscordSelectors.Typing.typing} strong`;
		class TypingUsersPopouts extends Plugin {
			onStart() {
				betterdiscord.DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
				this.patch();
			}
			async patch() {
				const [TypingUsersContainer, key] = getModuleWithKey(byStrings("typingUsers:"));
				const TypingUsers = await findChildComponent(TypingUsersContainer, key, (i) => i.prototype?.render);
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
						return BdApi.React.createElement(Popout, {
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
	
	})(new BdApi("TypingUsersPopouts"), Library, BdApi.React, {
		name: "TypingUsersPopouts",
		author: "Neodymium",
		description: "Opens the user's popout when clicking on a name in the typing area.",
		version: "1.3.0",
		source: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
		donate: "https://ko-fi.com/neodymium7",
		invite: "fRbsqH87Av"
	}, BasePlugin);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/