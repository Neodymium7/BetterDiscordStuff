/**
 * @name ActivityToggle
 * @author Neodymium
 * @version 1.2.17
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

'use strict';

const betterdiscord = new BdApi("ActivityToggle");
const React = BdApi.React;
const fs = require('fs');
const path = require('path');

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
function getIcon(searchString) {
	const filter = (m) => betterdiscord.Webpack.Filters.byStrings(searchString, '"svg"')(m) && typeof m === "function";
	return betterdiscord.Webpack.getModule(filter, {
		searchExports: true
	});
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
function expectSelectors(name, classes) {
	return expect(getSelectors(...classes), {
		name
	});
}
function expectIcon(name, searchString) {
	return expect(getIcon(searchString), {
		name,
		fallback: (_props) => null
	});
}
function byType(type) {
	return (e) => typeof e === type;
}

// @lib/utils/react.tsx
const EmptyComponent = (props) => null;

// modules.ts
const PanelButton = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("PANEL_BUTTON"),
	name: "PanelButton",
	fallback: EmptyComponent
});
const playSound = expectModule({
	filter: betterdiscord.Webpack.Filters.combine(
		betterdiscord.Webpack.Filters.byStrings("Unable to find sound for pack name:"),
		byType("function")
	),
	name: "playSound",
	searchExports: true
});
const ShowCurrentGame = expectModule({
	filter: (m) => m.G6?.useSetting,
	name: "ShowCurrentGame",
	fallback: {
		G6: {
			useSetting: () => React.useState(true),
			updateSetting: void 0
		}
	}
})?.G6;
const AccountSelectors = expectSelectors("Account Classes", [
	"avatarWrapper",
	"accountProfilePopoutWrapper",
	"container"
]);

// components/ActivityDisabledIcon.tsx
function ActivityDisabled(props) {
	return BdApi.React.createElement("svg", { width: props.width ? props.width : 24, height: props.height ? props.height : 24, viewBox: "0 0 24 24" }, BdApi.React.createElement(
		"path",
		{
			fill: "var(--status-danger)",
			d: "m 22.097645,1.0060792 c -0.228562,-0.026429 -0.47408,0.031766 -0.705098,0.2050764 L 1.4154195,21.193412 c -1.13712205,1.10129 0.304603,2.515921 1.398477,1.398425 L 22.789071,2.6095814 c 0.51979,-0.6932407 -0.0057,-1.5242148 -0.691426,-1.6035022 z M 7.4976235,2.5998159 c -0.382856,-0.020634 -0.876435,0.055238 -1.66411,0.2187481 -1.872909,0.3887889 -2.857503,1.0198214 -2.857503,1.8300627 0,0.2429057 -0.210992,0.5221791 -0.468763,0.6210891 -0.725529,0.278393 -1.236259,3.281886 -1.4434,8.4784442 -0.0939001,2.355548 -0.0860301,3.871508 0.07617,4.931598 L 17.169767,2.6447374 c -0.659606,-0.028927 -1.264479,0.055246 -1.666062,0.3183566 -1.121873,0.7350297 -5.8861385,0.7350297 -7.0080105,0 C 8.1531635,2.7386735 7.8804765,2.6204492 7.4976195,2.5998159 Z M 22.03905,6.1642388 19.783127,8.4200798 a 1.512586,1.512486 0 0 1 -0.8594,0.859368 l -2.025448,2.0273272 a 1.512586,1.512486 0 0 1 -1.136751,1.138662 l -3.367282,3.367159 c 1.234177,0.0023 2.450139,0.0081 2.607495,0.01953 0.181165,0.01313 0.80032,0.964518 1.375039,2.113265 0.57472,1.148741 1.268877,2.343045 1.543013,2.654275 0.74778,0.848961 2.234724,1.057275 3.365329,0.47265 1.605146,-0.829992 1.863624,-1.97593 1.650438,-7.324157 C 22.785794,9.9909478 22.472943,7.4274008 22.03905,6.1642378 Z M 6.0874275,6.4474398 c 1.104345,0 1.09964,0.824212 1.09964,0.824212 v 1.0996 h 1.072296 c 0,0 0.826195,-0.0047 0.826195,1.0996 0,1.1042752 -0.826195,1.1015542 -0.826195,1.1015542 h -1.072296 v 1.0996 c 0,0 0.0104,0.824212 -1.09964,0.824212 -1.11004,0 -1.099641,-0.824212 -1.099641,-0.824212 v -1.0996 h -1.128938 c 0,0 -0.824242,0.0027 -0.824242,-1.1015542 0,-1.104273 0.824242,-1.0996 0.824242,-1.0996 h 1.128938 v -1.0996 c 0,0 -0.0047,-0.824212 1.099641,-0.824212 z"
		}
	));
}

// @discord/icons.tsx
const Activity = expectIcon(
	"Activity",
	"M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09"
);
const Settings = expectIcon(
	"Settings",
	"M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53"
);

// @discord/modules.ts
const SettingsSections = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("ACCOUNT", "CHANGE_LOG"),
	searchExports: true,
	name: "SettingsSections",
	fallback: { ACCOUNT: "My Account", ACTIVITY_PRIVACY: "Activity Privacy" }
});
const UserSettingsWindow = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("saveAccountChanges", "setSection", "open"),
	name: "UserSettingsWindow"
});

// components/ActivityToggleButton.tsx
function ActivityToggleButton() {
	const activityEnabled = ShowCurrentGame.useSetting();
	return BdApi.React.createElement(
		PanelButton,
		{
			icon: activityEnabled ? Activity : ActivityDisabled,
			tooltipText: activityEnabled ? "Disable Activity" : "Enable Activity",
			onClick: () => {
				if (!ShowCurrentGame.updateSetting) {
					return betterdiscord.UI.alert("Error", "Could not update setting. See the console for more information.");
				}
				ShowCurrentGame.updateSetting(!activityEnabled);
				playSound?.(activityEnabled ? "activity_user_left" : "activity_user_join", 0.4);
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
								UserSettingsWindow.setSection(SettingsSections.ACTIVITY_PRIVACY);
								UserSettingsWindow.open();
							}
						}
					])
				);
			}
		}
	);
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

// index.tsx
class ActivityToggle {
	forceUpdate;
	meta;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		Updater.checkForUpdates(this.meta);
		if (AccountSelectors) betterdiscord.DOM.addStyle(`${AccountSelectors.avatarWrapper} { min-width: 70px; }`);
		this.patch();
	}
	patch() {
		if (!AccountSelectors) return;
		const element = document.querySelector(AccountSelectors.container);
		if (!element) return;
		const owner = betterdiscord.ReactUtils.getOwnerInstance(element);
		if (!owner) return;
		const Account = owner._reactInternals.type;
		this.forceUpdate = owner.forceUpdate.bind(owner);
		betterdiscord.Patcher.after(Account.prototype, "render", (_that, _args, ret) => {
			const buttonContainerFilter = (i) => Array.isArray(i?.props?.children) && i.props.children.some((e) => e?.props?.hasOwnProperty("selfMute"));
			const buttonContainer = betterdiscord.Utils.findInTree(ret.props.children, buttonContainerFilter, {
				walkable: ["children", "props"]
			});
			buttonContainer.props.children.unshift(BdApi.React.createElement(ActivityToggleButton, null));
		});
		this.forceUpdate?.();
	}
	stop() {
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
		this.forceUpdate?.();
		Updater.closeNotice();
	}
}

module.exports = ActivityToggle;

/*@end@*/