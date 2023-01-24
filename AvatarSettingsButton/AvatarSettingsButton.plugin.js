/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @description Moves the User Settings button to left clicking on the user avatar, with the status picker and context menu still available on configurable actions.
 * @version 2.0.5
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
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
		name: "AvatarSettingsButton",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "2.0.5",
		description: "Moves the User Settings button to left clicking on the user avatar, with the status picker and context menu still available on configurable actions.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
	},
	changelog: [
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed settings on latest Discord update."
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
    var Plugin = (function (betterdiscord, BasePlugin, react) {
		'use strict';
	
		// bundlebd
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
			if (changed) betterdiscord.Data.save("settings", settings);
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
						for (const listener of listeners) listener(key, value);
					},
					enumerable: true,
					configurable: false
				});
			}
			return settingsManager;
		}
	
		// utils.ts
		const Settings = createSettings({
			showTooltip: true,
			click: 1,
			contextmenu: 3,
			middleclick: 2
		});
	
		// components/SettingsPanel.tsx
		const {
			getModule: getModule$1,
			Filters: { byProps: byProps$1 }
		} = betterdiscord.Webpack;
		const Margins = getModule$1(byProps$1("marginXSmall"));
		const RadioGroup = getModule$1((m) => m.Sizes && m.toString().includes("radioItemClassName"), { searchExports: true });
		const SwitchItem = getModule$1((m) => m.toString?.().includes("().dividerDefault"), { searchExports: true });
		const SettingsItem = getModule$1((m) => m.render?.toString().includes("required"), { searchExports: true });
		const SettingsNote = getModule$1((m) => m.Types && m.toString().includes("selectable"), { searchExports: true });
		const SettingsDivider = getModule$1((m) => m.toString?.().includes("().divider") && m.toString().includes("style"), {
			searchExports: true
		});
		function SettingsPanel() {
			const settings = Settings.useSettingsState();
			return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(SettingsItem, {
				title: "Click"
			}, BdApi.React.createElement(SettingsNote, {
				className: Margins.marginBottom8,
				type: "description"
			}, "What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can use the Ctrl + , shortcut."), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: "Settings (Default)", value: 1 },
					{ name: "Settings Context Menu", value: 2 },
					{ name: "Status Picker", value: 3 },
					{ name: "Nothing", value: 0 }
				],
				onChange: ({ value }) => Settings.click = value,
				value: settings.click
			}), BdApi.React.createElement(SettingsDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(SettingsItem, {
				title: "Right Click",
				className: Margins.marginTop20
			}, BdApi.React.createElement(SettingsNote, {
				className: Margins.marginBottom8,
				type: "description"
			}, "What opens when right clicking on the user avatar."), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: "Settings", value: 1 },
					{ name: "Settings Context Menu", value: 2 },
					{ name: "Status Picker (Default)", value: 3 },
					{ name: "Nothing", value: 0 }
				],
				onChange: ({ value }) => Settings.contextmenu = value,
				value: settings.contextmenu
			}), BdApi.React.createElement(SettingsDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(SettingsItem, {
				title: "Middle Click",
				className: Margins.marginTop20
			}, BdApi.React.createElement(SettingsNote, {
				className: Margins.marginBottom8,
				type: "description"
			}, "What opens when middle clicking on the username."), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: "Settings", value: 1 },
					{ name: "Settings Context Menu (Default)", value: 2 },
					{ name: "Status Picker", value: 3 },
					{ name: "Nothing", value: 0 }
				],
				onChange: ({ value }) => Settings.middleclick = value,
				value: settings.middleclick
			}), BdApi.React.createElement(SettingsDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(SwitchItem, {
				className: Margins.marginTop20,
				children: "Tooltip",
				note: "Show tooltip when hovering over user avatar.",
				onChange: (v) => Settings.showTooltip = v,
				value: settings.showTooltip,
				hideBorder: true
			}));
		}
	
		// index.tsx
		const {
			Filters: { byProps },
			getModule
		} = betterdiscord.Webpack;
		const UserSettingsWindow = getModule(byProps("saveAccountChanges"));
		const Sections = getModule(byProps("ACCOUNT"), { searchExports: true });
		const accountClasses = getModule(byProps("buildOverrideButton"));
		const tooltipClasses = getModule(byProps("tooltipContent"));
		const layerContainerClass = getModule(byProps("layerContainer")).layerContainer;
		const appClass = getModule(byProps("appDevToolsWrapper")).app;
		const settingsSelector = `.${accountClasses.container} button:nth-last-child(1)`;
		class Tooltip {
			target;
			tooltip;
			layerContainer;
			ref;
			clearListeners;
			constructor(target, text) {
				this.target = target;
				this.layerContainer = document.querySelector(`.${appClass} ~ .${layerContainerClass}`);
				const pointer = document.createElement("div");
				pointer.className = tooltipClasses.tooltipPointer;
				pointer.style.left = "calc(50% + 0px)";
				const content = document.createElement("div");
				content.className = tooltipClasses.tooltipContent;
				content.innerHTML = text;
				this.tooltip = document.createElement("div", {});
				this.tooltip.style.position = "fixed";
				this.tooltip.style.opacity = "0";
				this.tooltip.style.transform = "scale(0.95)";
				this.tooltip.style.transition = "opacity 0.1s, transform 0.1s";
				this.tooltip.className = `${tooltipClasses.tooltip} ${tooltipClasses.tooltipTop} ${tooltipClasses.tooltipPrimary}`;
				this.tooltip.appendChild(pointer);
				this.tooltip.appendChild(content);
				const show = () => this.show();
				const hide = () => this.hide();
				this.target.addEventListener("mouseenter", show);
				this.target.addEventListener("mouseleave", hide);
				this.clearListeners = () => {
					this.target.removeEventListener("mouseenter", show);
					this.target.removeEventListener("mouseleave", hide);
				};
			}
			show() {
				this.ref = this.tooltip.cloneNode(true);
				this.layerContainer.appendChild(this.ref);
				const targetRect = this.target.getBoundingClientRect();
				const tooltipRect = this.ref.getBoundingClientRect();
				this.ref.style.top = `${targetRect.top - tooltipRect.height - 8}px`;
				this.ref.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
				this.ref.style.opacity = "1";
				this.ref.style.transform = "none";
			}
			hide() {
				const ref = this.ref;
				ref.style.opacity = "0";
				ref.style.transform = "scale(0.95)";
				setTimeout(() => ref?.remove(), 100);
			}
			forceHide() {
				this.ref?.remove();
			}
			remove() {
				this.clearListeners();
				this.forceHide();
			}
		}
		class AvatarSettingsButton extends BasePlugin {
			target = null;
			tooltip = null;
			clearListeners;
			onStart() {
				betterdiscord.DOM.addStyle(`${settingsSelector} { display: none; } .${accountClasses.withTagAsButton} { width: 100%; }`);
				Settings.addListener(() => {
					this.addListeners();
					this.addTooltip();
				});
				this.target = document.querySelector("." + accountClasses.avatarWrapper);
				this.addListeners();
				this.addTooltip();
			}
			observer({ addedNodes }) {
				for (const node of addedNodes) {
					if (node.nodeType === Node.TEXT_NODE)
						continue;
					const avatarWrapper = node.querySelector(`.${accountClasses.avatarWrapper}`);
					if (avatarWrapper) {
						this.target = avatarWrapper;
						this.addListeners();
						this.addTooltip();
					}
				}
			}
			openPopout() {
				this.target.dispatchEvent(
					new MouseEvent("click", {
						bubbles: true
					})
				);
			}
			openSettings() {
				UserSettingsWindow.setSection(Sections.ACCOUNT);
				UserSettingsWindow.open();
				if (document.querySelector("#status-picker") || document.querySelector("#account"))
					this.openPopout();
			}
			openContextMenu(e) {
				document.querySelector(settingsSelector).dispatchEvent(
					new MouseEvent("contextmenu", {
						bubbles: true,
						clientX: e.clientX,
						clientY: screen.height - 12
					})
				);
				if (document.querySelector("#status-picker") || document.querySelector("#account"))
					this.openPopout();
			}
			addListeners() {
				if (!this.target)
					return;
				this.clearListeners?.();
				const actions = [
					null,
					this.openSettings.bind(this),
					this.openContextMenu.bind(this),
					this.openPopout.bind(this)
				];
				const clickAction = actions[Settings.click];
				const click = (e) => {
					if (e.isTrusted) {
						e.preventDefault();
						e.stopPropagation();
						clickAction(e);
						this.tooltip?.forceHide();
					}
				};
				const contextmenuAction = actions[Settings.contextmenu];
				const contextmenu = (e) => {
					contextmenuAction(e);
					this.tooltip?.forceHide();
				};
				const middleclickAction = actions[Settings.middleclick];
				const middleclick = (e) => {
					if (e.button === 1) {
						middleclickAction(e);
						this.tooltip?.forceHide();
					}
				};
				this.target.addEventListener("click", click);
				this.target.addEventListener("contextmenu", contextmenu);
				this.target.addEventListener("mousedown", middleclick);
				this.clearListeners = () => {
					this.target.removeEventListener("click", click);
					this.target.removeEventListener("contextmenu", contextmenu);
					this.target.removeEventListener("mousedown", middleclick);
				};
			}
			addTooltip() {
				if (!this.target)
					return;
				this.tooltip?.remove();
				this.tooltip = null;
				if (!Settings.showTooltip)
					return;
				const click = Settings.click;
				if (click === 0)
					return;
				const tooltips = ["", "User Settings", "Settings Shortcuts", "Set Status"];
				this.tooltip = new Tooltip(this.target, tooltips[click]);
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				Settings.clearListeners();
				this.clearListeners?.();
				this.tooltip?.remove();
				this.target = null;
				this.tooltip = null;
			}
			getSettingsPanel() {
				return BdApi.React.createElement(SettingsPanel, null);
			}
		}
	
		return AvatarSettingsButton;
	
	})(new BdApi("AvatarSettingsButton"), BasePlugin, BdApi.React);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/