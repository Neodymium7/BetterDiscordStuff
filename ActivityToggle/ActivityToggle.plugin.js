/**
 * @name ActivityToggle
 * @author Neodymium
 * @version 1.2.9
 * @description Adds a button to quickly toggle Activity Status.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityToggle/ActivityToggle.plugin.js
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
		name: "ActivityToggle",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.2.9",
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
				filter: bySourceStrings(searchString),
				name,
				fallback: { Z: (_props) => null }
			}).Z;
		}
	
		// modules.ts
		const {
			Filters: { byProps, byStrings }
		} = betterdiscord.Webpack;
		const Sections = expectModule(byProps("ACCOUNT"), {
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
		const playSound = expectModule({
			filter: byStrings(".getSoundpack()"),
			searchExports: true,
			name: "playSound"
		});
		const { useSetting, updateSetting } = expectModule({
			filter: (m) => Object.values(m).some((e) => e?.useSetting),
			name: "ActivitySettingManager",
			fallback: {
				G6: {
					useSetting: () => React.useState(true),
					updateSetting: void 0
				}
			}
		}).G6;
		const UserSettingsWindow = expectModule({
			filter: byProps("open", "updateAccount"),
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
			}, BdApi.React.createElement("g", {
				fill: "none",
				fillRule: "evenodd"
			}, BdApi.React.createElement("path", {
				fill: "currentColor",
				d: "m 5.707493,4.903746 c -1.5957556,0 -2.921198,1.232272 -3.0348909,2.823972 l -0.6679103,9.346058 c -0.0032,0.04477 -0.00469,0.09105 -0.00469,0.135925 0,0.286145 0.068875,0.553783 0.1827966,0.796805 L 7.1745522,13.014755 H 5.9160685 v -2.02951 H 3.8889021 V 8.958078 H 5.9160685 V 6.930913 H 7.943235 v 2.027165 h 2.0295102 v 1.258484 L 15.285561,4.903746 Z m 15.366625,1.832652 -4.813642,4.813642 -3.491882,3.491882 h 4.300405 l 0.522611,2.088099 c 0.289036,1.156141 1.327587,1.966233 2.519311,1.966233 0.04489,0 0.08882,-0.0014 0.133582,-0.0047 1.040108,-0.0743 1.824922,-0.977685 1.750628,-2.01779 l -0.66791,-9.346079 c -0.02519,-0.352659 -0.11926,-0.683371 -0.253103,-0.99132 z m -2.484157,3.236436 c 0.839921,0 1.52096,0.681039 1.52096,1.52096 0,0.839923 -0.681039,1.520961 -1.52096,1.520961 -0.839923,0 -1.520962,-0.681038 -1.520962,-1.520961 0,-0.839921 0.681039,-1.52096 1.520962,-1.52096 z M 7.943235,10.985245 v 1.260827 l 1.2608277,-1.260827 z"
			}), BdApi.React.createElement("path", {
				fill: "currentColor",
				className: props.foreground,
				d: "M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z"
			})));
		}
	
		// components/ActivityToggleButton.tsx
		function ActivityToggleButton() {
			const activityEnabled = useSetting();
			return BdApi.React.createElement(PanelButton, {
				icon: activityEnabled ? Activity : ActivityDisabled,
				iconForeground: activityEnabled ? null : AccountClasses.strikethrough,
				tooltipText: activityEnabled ? "Disable Activity" : "Enable Activity",
				onClick: () => {
					if (!updateSetting) {
						return betterdiscord.UI.alert("Error", "Could not update setting. See the console for more information.");
					}
					updateSetting(!activityEnabled);
					playSound(activityEnabled ? "activity_user_left" : "activity_user_join", 0.4);
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
					ret.props.children[1].props.children.unshift(BdApi.React.createElement(ActivityToggleButton, null));
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