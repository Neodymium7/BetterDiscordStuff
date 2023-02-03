/**
 * @name ActivityToggle
 * @author Neodymium
 * @description Adds a button to quickly toggle Activity Status.
 * @version 1.2.5
 * @invite fRbsqH87Av
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityToggle/ActivityToggle.plugin.js
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
		version: "1.2.5",
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
    var Plugin = (function (betterdiscord, zlibrary, Plugin) {
		'use strict';
	
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
		const {
			Filters: { byProps: byProps$1, byStrings },
			getModule: getModule$1
		} = betterdiscord.Webpack;
		const { UserSettingsWindow } = zlibrary.DiscordModules;
		const Sections = getModule$1(byProps$1("ACCOUNT"), { searchExports: true });
		const PanelButton = getModule$1(byStrings("PANEL_BUTTON"));
		const Activity = getModule$1(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"));
		const Settings = getModule$1(byStrings("M14 7V9C14 9 12.5867 9"));
		const playSound = getModule$1(byStrings(".getSoundpack()"), { searchExports: true });
		const { useSetting, updateSetting } = getModule$1((m) => Object.values(m).some((e) => e?.getSetting)).G6;
		function ActivityToggleButton() {
			const enabled = useSetting();
			return BdApi.React.createElement(PanelButton, {
				icon: enabled ? Activity : ActivityDisabled,
				iconForeground: enabled ? null : zlibrary.DiscordClasses.AccountDetails.strikethrough,
				tooltipText: enabled ? "Disable Activity" : "Enable Activity",
				onClick: () => {
					updateSetting(!enabled);
					playSound(enabled ? "stream_user_left" : "stream_user_joined", 0.4);
				},
				onContextMenu: (e) => {
					betterdiscord.ContextMenu.open(
						e,
						betterdiscord.ContextMenu.buildMenu([
							{
								label: "Activity Settings",
								icon: Settings,
								action: () => {
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
		const {
			getModule,
			Filters: { byProps }
		} = betterdiscord.Webpack;
		const { withTagAsButton } = getModule(byProps("withTagAsButton"));
		class ActivityToggle extends Plugin {
			async onStart() {
				betterdiscord.DOM.addStyle(`.${withTagAsButton} { min-width: 70px; }`);
				const Account = await zlibrary.ReactComponents.getComponent(
					"Account",
					zlibrary.DiscordSelectors.AccountDetails.container,
					(c) => c.prototype.renderNameZone
				);
				betterdiscord.Patcher.after(Account.component.prototype, "render", (_thisObject, [_props], ret) => {
					ret.props.children[1].props.children.unshift(BdApi.React.createElement(ActivityToggleButton, null));
				});
				betterdiscord.ReactUtils.getInternalInstance(document.querySelector(Account.selector)).return.stateNode.forceUpdate();
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				betterdiscord.Patcher.unpatchAll();
			}
		}
	
		return ActivityToggle;
	
	})(new BdApi("ActivityToggle"), Library, BasePlugin);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/