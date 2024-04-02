/**
 * @name ActivityToggle
 * @author Neodymium
 * @version 1.2.12
 * @description Adds a button to quickly toggle Activity Status.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityToggle/ActivityToggle.plugin.js
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
		name: "ActivityToggle",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.2.12",
		description: "Adds a button to quickly toggle Activity Status.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityToggle/ActivityToggle.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/ActivityToggle/ActivityToggle.plugin.js"
	}
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
	const Plugin = (function (betterdiscord, Plugin, React) {
		'use strict';
	
		// meta
		const name = "ActivityToggle";
	
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
		function bySourceStrings(...strings) {
			return (_e, _m, i) => {
				const moduleSource = betterdiscord.Webpack.modules[i].toString();
				let match = true;
				for (const string of strings) {
					if (!moduleSource.includes(string)) {
						match = false;
						break;
					}
				}
				return match;
			};
		}
		function getIcon(name, searchString) {
			return expectModule({
				filter: (e, m, i) => {
					return bySourceStrings(searchString)(e, m, i) && typeof e == "function";
				},
				name,
				fallback: (_props) => null
			});
		}
	
		// modules.ts
		const {
			Filters: { byKeys, byStrings }
		} = betterdiscord.Webpack;
		const Sections = expectModule(byKeys("ACCOUNT", "ACCESSIBILITY"), {
			searchExports: true,
			name: "Sections",
			fallback: {
				ACTIVITY_PRIVACY: "Activity Privacy"
			}
		});
		const PanelButton = expectModule({
			filter: byStrings("PANEL_BUTTON"),
			name: "PanelButton",
			fatal: true
		});
		const Activity = getIcon("Activity", "M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264");
		const Settings = getIcon("Settings", "M14 7V9C14 9 12.5867 9");
		const Sounds = expectModule({
			filter: byKeys("playSound", "createSound"),
			name: "Sounds"
		});
		const ShowCurrentGame = expectModule({
			filter: byKeys("ShowCurrentGame"),
			name: "ShowCurrentGame",
			fallback: {
				ShowCurrentGame: {
					useSetting: () => React.useState(true),
					updateSetting: void 0
				}
			}
		})?.ShowCurrentGame;
		const UserSettingsWindow = expectModule({
			filter: byKeys("open", "updateAccount"),
			name: "UserSettingsWindow"
		});
		const AccountSelectors = getSelectors("Account Classes", ["withTagAsButton", "container"]);
		const AccountClasses = getClasses("Account Classes", ["withTagAsButton", "strikethrough"]);
	
		// components/ActivityDisabledIcon.tsx
		function ActivityDisabled(props) {
			return BdApi.React.createElement("svg", {
				width: props.width ? props.width : 24,
				height: props.height ? props.height : 24,
				viewBox: "0 0 24 24"
			}, BdApi.React.createElement("path", {
				fill: "currentColor",
				className: props.foreground,
				d: "m 22.097645,1.0060792 c -0.228562,-0.026429 -0.47408,0.031766 -0.705098,0.2050764 L 1.4154195,21.193412 c -1.13712205,1.10129 0.304603,2.515921 1.398477,1.398425 L 22.789071,2.6095814 c 0.51979,-0.6932407 -0.0057,-1.5242148 -0.691426,-1.6035022 z M 7.4976235,2.5998159 c -0.382856,-0.020634 -0.876435,0.055238 -1.66411,0.2187481 -1.872909,0.3887889 -2.857503,1.0198214 -2.857503,1.8300627 0,0.2429057 -0.210992,0.5221791 -0.468763,0.6210891 -0.725529,0.278393 -1.236259,3.281886 -1.4434,8.4784442 -0.0939001,2.355548 -0.0860301,3.871508 0.07617,4.931598 L 17.169767,2.6447374 c -0.659606,-0.028927 -1.264479,0.055246 -1.666062,0.3183566 -1.121873,0.7350297 -5.8861385,0.7350297 -7.0080105,0 C 8.1531635,2.7386735 7.8804765,2.6204492 7.4976195,2.5998159 Z M 22.03905,6.1642388 19.783127,8.4200798 a 1.512586,1.512486 0 0 1 -0.8594,0.859368 l -2.025448,2.0273272 a 1.512586,1.512486 0 0 1 -1.136751,1.138662 l -3.367282,3.367159 c 1.234177,0.0023 2.450139,0.0081 2.607495,0.01953 0.181165,0.01313 0.80032,0.964518 1.375039,2.113265 0.57472,1.148741 1.268877,2.343045 1.543013,2.654275 0.74778,0.848961 2.234724,1.057275 3.365329,0.47265 1.605146,-0.829992 1.863624,-1.97593 1.650438,-7.324157 C 22.785794,9.9909478 22.472943,7.4274008 22.03905,6.1642378 Z M 6.0874275,6.4474398 c 1.104345,0 1.09964,0.824212 1.09964,0.824212 v 1.0996 h 1.072296 c 0,0 0.826195,-0.0047 0.826195,1.0996 0,1.1042752 -0.826195,1.1015542 -0.826195,1.1015542 h -1.072296 v 1.0996 c 0,0 0.0104,0.824212 -1.09964,0.824212 -1.11004,0 -1.099641,-0.824212 -1.099641,-0.824212 v -1.0996 h -1.128938 c 0,0 -0.824242,0.0027 -0.824242,-1.1015542 0,-1.104273 0.824242,-1.0996 0.824242,-1.0996 h 1.128938 v -1.0996 c 0,0 -0.0047,-0.824212 1.099641,-0.824212 z"
			}));
		}
	
		// components/ActivityToggleButton.tsx
		function ActivityToggleButton() {
			const activityEnabled = ShowCurrentGame.useSetting();
			return BdApi.React.createElement(PanelButton, {
				icon: activityEnabled ? Activity : ActivityDisabled,
				iconForeground: activityEnabled ? null : AccountClasses.strikethrough,
				tooltipText: activityEnabled ? "Disable Activity" : "Enable Activity",
				onClick: () => {
					if (!ShowCurrentGame.updateSetting) {
						return betterdiscord.UI.alert("Error", "Could not update setting. See the console for more information.");
					}
					ShowCurrentGame.updateSetting(!activityEnabled);
					Sounds.playSound(activityEnabled ? "activity_user_left" : "activity_user_join", 0.4);
				},
				onContextMenu: (e) => {
					betterdiscord.ContextMenu.open(
						e,
						betterdiscord.ContextMenu.buildMenu([
							{
								label: "Activity Settings",
								icon: Settings,
								action: () => {
									if (!UserSettingsWindow) {
										return betterdiscord.UI.alert(
											"Error",
											"Could not open settings window. See the console for more information."
										);
									}
									UserSettingsWindow.setSection(Sections.ACTIVITY_PRIVACY);
									UserSettingsWindow.open();
								}
							}
						])
					);
				}
			});
		}
	
		// index.tsx
		class ActivityToggle extends Plugin {
			forceUpdate;
			async onStart() {
				betterdiscord.DOM.addStyle(`${AccountSelectors.withTagAsButton} { min-width: 70px; }`);
				const owner = betterdiscord.ReactUtils.getOwnerInstance(document.querySelector(AccountSelectors.container));
				const Account = owner._reactInternals.type;
				this.forceUpdate = owner.forceUpdate.bind(owner);
				betterdiscord.Patcher.after(Account.prototype, "render", (_that, [_props], ret) => {
					const buttonContainerFilter = (i) => Array.isArray(i?.props?.children) && i.props.children.some((e) => e?.props?.hasOwnProperty("selfMute"));
					const buttonContainer = betterdiscord.Utils.findInTree(ret.props.children, buttonContainerFilter, {
						walkable: ["children", "props"]
					});
					buttonContainer.props.children.unshift(BdApi.React.createElement(ActivityToggleButton, null));
				});
				this.forceUpdate();
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				betterdiscord.Patcher.unpatchAll();
				this.forceUpdate?.();
			}
		}
	
		return ActivityToggle;
	
	})(new BdApi("ActivityToggle"), BasePlugin, BdApi.React);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/