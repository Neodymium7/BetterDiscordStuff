/**
 * @name RoleMentionIcons
 * @author Neodymium
 * @version 1.3.3
 * @description Displays icons next to role mentions.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js
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
		name: "RoleMentionIcons",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.3.3",
		description: "Displays icons next to role mentions.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/RoleMentionIcons/RoleMentionIcons.plugin.js"
	},
	changelog: [
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed plugin not working after Discord's string changes."
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
	const Plugin = (function (betterdiscord, BasePlugin, react) {
		'use strict';
	
		// meta
		const name = "RoleMentionIcons";
	
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
		function getClasses(name, classes) {
			return expectModule({
				filter: betterdiscord.Webpack.Filters.byProps(...classes),
				name,
				fallback: classes.reduce((obj, key) => {
					obj[key] = "unknown-class";
					return obj;
				}, {})
			});
		}
	
		// modules/discordmodules.tsx
		const {
			Filters: { byKeys },
			getStore
		} = betterdiscord.Webpack;
		const Error$1 = (_props) => BdApi.React.createElement("div", null, BdApi.React.createElement("h1", {
			style: { color: "red" }
		}, "Error: Component not found"));
		const Common = expectModule({
			filter: byKeys("FormSwitch"),
			name: "Common",
			fallback: {
				FormSwitch: Error$1
			}
		});
		const roleMention = getClasses("Role Mention Class", ["roleMention"]).roleMention.split(" ")[0];
		const GuildStore = getStore("GuildStore");
	
		// @lib/settings.ts
		function createSettings(defaultSettings) {
			let settings = betterdiscord.Data.load("settings");
			const listeners = new Set();
			if (!settings) {
				betterdiscord.Data.save("settings", defaultSettings);
				settings = defaultSettings;
			}
			if (Object.keys(settings) !== Object.keys(defaultSettings)) {
				settings = { ...defaultSettings, ...settings };
			}
			let changed = false;
			for (const key in settings) {
				if (!(key in defaultSettings)) {
					delete settings[key];
					changed = true;
				}
			}
			if (changed)
				betterdiscord.Data.save("settings", settings);
			const settingsManager = {
				addListener(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				clearListeners() {
					listeners.clear();
				},
				useSettingsState() {
					const [state, setState] = react.useState(settings);
					react.useEffect(() => {
						return settingsManager.addListener((key, value) => {
							setState((state2) => ({ ...state2, [key]: value }));
						});
					}, []);
					return state;
				}
			};
			for (const key in settings) {
				Object.defineProperty(settingsManager, key, {
					get() {
						return settings[key];
					},
					set(value) {
						settings[key] = value;
						betterdiscord.Data.save("settings", settings);
						for (const listener of listeners)
							listener(key, value);
					},
					enumerable: true,
					configurable: false
				});
			}
			return settingsManager;
		}
	
		// @lib/strings.ts
		const LocaleStore = betterdiscord.Webpack.getModule((m) => m._dispatchToken && m.getName() === "LocaleStore");
		function createStrings(locales, defaultLocale) {
			let strings = locales[defaultLocale];
			const setLocale = () => {
				strings = locales[LocaleStore.locale] || locales[defaultLocale];
			};
			const stringsManager = {
				subscribe() {
					setLocale();
					LocaleStore.addChangeListener(setLocale);
				},
				unsubscribe() {
					LocaleStore.removeChangeListener(setLocale);
				}
			};
			for (const key in strings) {
				Object.defineProperty(stringsManager, key, {
					get() {
						return strings[key] || locales[defaultLocale][key];
					},
					enumerable: true,
					configurable: false
				});
			}
			return stringsManager;
		}
	
		// locales.json
		const el = {
			SETTINGS_EVERYONE: "@everyone",
			SETTINGS_EVERYONE_NOTE: "Εμφάνιση εικονιδίων στις αναφορές «@everyone».",
			SETTINGS_HERE: "@here",
			SETTINGS_HERE_NOTE: "Εμφάνιση εικονιδίων στις αναφορές «@here».",
			SETTINGS_ROLE_ICONS: "Εικονίδια Ρόλων",
			SETTINGS_ROLE_ICONS_NOTE: "Εμφάνιση Εικονιδίων Ρόλων αντί για το προεπιλεγμένο εικονίδιο όταν είναι διαθέσιμο."
		};
		const fr = {
			SETTINGS_EVERYONE: "@everyone",
			SETTINGS_EVERYONE_NOTE: "Affiche des icônes sur les mentions \"@everyone\".",
			SETTINGS_HERE: "@here",
			SETTINGS_HERE_NOTE: "Affiche des icônes sur les mentions \"@here\".",
			SETTINGS_ROLE_ICONS: "Icônes de Rôle",
			SETTINGS_ROLE_ICONS_NOTE: "Affiche des icônes de rôle au lieu des icônes par défaut quand applicable"
		};
		const locales = {
			"en-US": {
			SETTINGS_EVERYONE: "@everyone",
			SETTINGS_EVERYONE_NOTE: "Shows icons on \"@everyone\" mentions.",
			SETTINGS_HERE: "@here",
			SETTINGS_HERE_NOTE: "Shows icons on \"@here\" mentions.",
			SETTINGS_ROLE_ICONS: "Role Icons",
			SETTINGS_ROLE_ICONS_NOTE: "Shows Role Icons instead of default icon when applicable."
		},
			el: el,
			fr: fr
		};
	
		// modules/utils.ts
		const Settings = createSettings({
			everyone: true,
			here: true,
			showRoleIcons: true
		});
		const Strings = createStrings(locales, "en-US");
		const peopleSVG = (() => {
			const element = document.createElement("div");
			element.innerHTML = '<svg class="role-mention-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14" width="14"><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M20.0001 20.006H22.0001V19.006C22.0001 16.4433 20.2697 14.4415 17.5213 13.5352C19.0621 14.9127 20.0001 16.8059 20.0001 19.006V20.006Z" fill="currentColor" /><path d="M14.8834 11.9077C16.6657 11.5044 18.0001 9.9077 18.0001 8.00598C18.0001 5.96916 16.4693 4.28218 14.4971 4.0367C15.4322 5.09511 16.0001 6.48524 16.0001 8.00598C16.0001 9.44888 15.4889 10.7742 14.6378 11.8102C14.7203 11.8418 14.8022 11.8743 14.8834 11.9077Z" fill="currentColor" /></svg>';
			return element.firstChild;
		})();
		const getIconElement = (roleId, roleIcon) => {
			const icon = document.createElement("img");
			icon.className = "role-mention-icon";
			icon.setAttribute("style", "border-radius: 3px; object-fit: contain;");
			icon.width = icon.height = 16;
			icon.src = `https://cdn.discordapp.com/role-icons/${roleId}/${roleIcon}.webp?size=24&quality=lossless`;
			return icon;
		};
		const from = (arr) => arr && arr.length > 0 && Object.assign(...arr.map(([k, v]) => ({ [k]: v })));
		const filter = (obj, predicate) => from(
			Object.entries(obj).filter((o) => {
				return predicate(o[1]);
			})
		);
		const getProps = (el, filter2) => {
			const reactInstance = betterdiscord.ReactUtils.getInternalInstance(el);
			let current = reactInstance?.return;
			while (current) {
				if (current.pendingProps && filter2(current.pendingProps))
					return current.pendingProps;
				current = current.return;
			}
			return null;
		};
	
		// components/SettingsPanel.tsx
		function SettingsPanel() {
			const settingsState = Settings.useSettingsState();
			return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(Common.FormSwitch, {
				children: Strings.SETTINGS_EVERYONE,
				note: Strings.SETTINGS_EVERYONE_NOTE,
				value: settingsState.everyone,
				onChange: (v) => {
					Settings.everyone = v;
				}
			}), BdApi.React.createElement(Common.FormSwitch, {
				children: Strings.SETTINGS_HERE,
				note: Strings.SETTINGS_HERE_NOTE,
				value: settingsState.here,
				onChange: (v) => {
					Settings.here = v;
				}
			}), BdApi.React.createElement(Common.FormSwitch, {
				children: Strings.SETTINGS_ROLE_ICONS,
				note: Strings.SETTINGS_ROLE_ICONS_NOTE,
				value: settingsState.showRoleIcons,
				onChange: (v) => {
					Settings.showRoleIcons = v;
				}
			}));
		}
	
		// index.tsx
		class RoleMentionIcons extends BasePlugin {
			clearCallbacks;
			constructor() {
				super();
				this.clearCallbacks = new Set();
			}
			onStart() {
				betterdiscord.DOM.addStyle(
					`.role-mention-icon { position: relative; height: 1em; width: 1em; margin-left: 4px; } .${roleMention} { display: inline-flex; align-items: center; }`
				);
				Strings.subscribe();
				const elements = Array.from(document.getElementsByClassName(roleMention));
				this.processElements(elements);
			}
			observer({ addedNodes }) {
				for (const node of addedNodes) {
					if (node.nodeType === Node.TEXT_NODE)
						continue;
					const elements = Array.from(node.getElementsByClassName(roleMention));
					this.processElements(elements);
				}
			}
			processElements(elements) {
				if (!elements.length)
					return;
				for (const element of elements) {
					const props = getProps(element, (e) => e.roleName || e.roleId);
					if (!props)
						return;
					const isEveryone = props.roleName === "@everyone";
					const isHere = props.roleName === "@here";
					let role;
					if (props.guildId) {
						role = filter(GuildStore.getRoles(props.guildId), (r) => r.id === props.roleId);
						role = role[Object.keys(role)[0]];
					}
					if ((Settings.everyone || !isEveryone) && (Settings.here || !isHere)) {
						if (role?.icon && Settings.showRoleIcons) {
							const icon = getIconElement(role.id, role.icon);
							element.appendChild(icon);
							this.clearCallbacks.add(() => icon.remove());
						} else {
							const icon = peopleSVG.cloneNode(true);
							element.appendChild(icon);
							this.clearCallbacks.add(() => icon.remove());
						}
					}
				}
			}
			clearIcons() {
				this.clearCallbacks.forEach((callback) => callback());
				this.clearCallbacks.clear();
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				Strings.unsubscribe();
				this.clearIcons();
			}
			getSettingsPanel() {
				return BdApi.React.createElement(SettingsPanel, null);
			}
		}
	
		return RoleMentionIcons;
	
	})(new BdApi("RoleMentionIcons"), BasePlugin, BdApi.React);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/