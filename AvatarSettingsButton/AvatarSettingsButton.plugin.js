/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @description Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions.
 * @version 2.0.0
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
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
		authors: [{
			name: "Neodymium",
		}],
		version: "2.0.0",
		description: "Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
	},
	changelog: [{
		title: "Fixed",
		type: "fixed",
		items: ["Rewrote the plugin to use DOM Manipulation instead of patching for compatibility with Discord's latest update."]
	}]
};

if (!global.ZeresPluginLibrary) {
	BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
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
	let Plugin;

	(() => {
		var __webpack_modules__ = {
			113: module => {
				"use strict";
				module.exports = BdApi.React
			}
		};
		var __webpack_module_cache__ = {};

		function __webpack_require__(moduleId) {
			var cachedModule = __webpack_module_cache__[moduleId];
			if (void 0 !== cachedModule) return cachedModule.exports;
			var module = __webpack_module_cache__[moduleId] = {
				exports: {}
			};
			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
			return module.exports
		}(() => {
			__webpack_require__.n = module => {
				var getter = module && module.__esModule ? () => module["default"] : () => module;
				__webpack_require__.d(getter, {
					a: getter
				});
				return getter
			}
		})();
		(() => {
			__webpack_require__.d = (exports, definition) => {
				for (var key in definition)
					if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
						enumerable: true,
						get: definition[key]
					})
			}
		})();
		(() => {
			__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
		})();
		(() => {
			__webpack_require__.r = exports => {
				if ("undefined" !== typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
					value: "Module"
				});
				Object.defineProperty(exports, "__esModule", {
					value: true
				})
			}
		})();
		var __webpack_exports__ = {};
		(() => {
			"use strict";
			__webpack_require__.r(__webpack_exports__);
			__webpack_require__.d(__webpack_exports__, {
				default: () => AvatarSettingsButton
			});
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			const external_BdApi_namespaceObject = BdApi;
			var external_BdApi_React_ = __webpack_require__(113);
			const external_AvatarSettingsButton_namespaceObject = "AvatarSettingsButton";
			var external_AvatarSettingsButton_default = __webpack_require__.n(external_AvatarSettingsButton_namespaceObject);
			class SettingsManager {
				constructor(defaultSettings) {
					this.settings = (0, external_BdApi_namespaceObject.loadData)(external_AvatarSettingsButton_default(), "settings");
					if (!this.settings) {
						(0, external_BdApi_namespaceObject.saveData)(external_AvatarSettingsButton_default(), "settings", defaultSettings);
						this.settings = defaultSettings
					}
					if (Object.keys(this.settings) !== Object.keys(defaultSettings)) this.settings = {
						...defaultSettings,
						...this.settings
					};
					this.listeners = new Set;
					this.keys = Object.keys(this.settings)
				}
				get(key) {
					return this.settings[key]
				}
				set(key, value) {
					this.settings[key] = value;
					(0, external_BdApi_namespaceObject.saveData)(external_AvatarSettingsButton_default(), "settings", this.settings);
					for (const listener of this.listeners) listener(key, value)
				}
				addListener(listener) {
					this.listeners.add(listener);
					return () => {
						this.listeners.delete(listener)
					}
				}
				clearListeners() {
					this.listeners.clear()
				}
				useSettingState(key) {
					const [setting, setSetting] = (0, external_BdApi_React_.useState)(this.get(key));
					(0, external_BdApi_React_.useEffect)((() => this.addListener(((changedKey, value) => {
						if (changedKey === key) setSetting(value)
					}))), []);
					return setting
				}
				useSettingsState() {
					const [settings, setSettings] = (0, external_BdApi_React_.useState)(this.settings);
					(0, external_BdApi_React_.useEffect)((() => this.addListener(((changedKey, value) => {
						setSettings((prevSettings => ({
							...prevSettings,
							[changedKey]: value
						})))
					}))), []);
					return settings
				}
			}
			const Settings = new SettingsManager({
				showTooltip: true,
				click: 1,
				contextmenu: 3,
				middleclick: 2
			});
			var React = __webpack_require__(113);
			const {
				getModule,
				Filters: {
					byProps
				}
			} = external_BdApi_namespaceObject.Webpack;
			const Margins = getModule(byProps("marginXSmall"));
			const RadioGroup = getModule((m => m.Sizes && m.toString().includes("radioItemClassName")));
			const SwitchItem = getModule((m => m.toString().includes("helpdeskArticleId")));
			const SettingsItem = getModule((m => m.Tags && m.toString().includes("required")));
			const SettingsNote = getModule((m => m.Types && m.toString().includes("selectable")));
			const SettingsDivider = getModule((m => m.toString().includes("().divider")));

			function SettingsPanel() {
				const settings = Settings.useSettingsState();
				return React.createElement(React.Fragment, null, React.createElement(SettingsItem, {
					title: "Click"
				}, React.createElement(SettingsNote, {
					className: Margins.marginBottom8,
					type: "description"
				}, "What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can use the Ctrl + , shortcut."), React.createElement(RadioGroup, {
					options: [{
						name: "Settings (Default)",
						value: 1
					}, {
						name: "Settings Context Menu",
						value: 2
					}, {
						name: "Status Picker",
						value: 3
					}, {
						name: "Nothing",
						value: 0
					}],
					onChange: ({
						value
					}) => Settings.set("click", value),
					value: settings.click
				}), React.createElement(SettingsDivider, {
					className: Margins.marginTop20
				})), React.createElement(SettingsItem, {
					title: "Right Click",
					className: Margins.marginTop20
				}, React.createElement(SettingsNote, {
					className: Margins.marginBottom8,
					type: "description"
				}, "What opens when right clicking on the user avatar."), React.createElement(RadioGroup, {
					options: [{
						name: "Settings",
						value: 1
					}, {
						name: "Settings Context Menu",
						value: 2
					}, {
						name: "Status Picker (Default)",
						value: 3
					}, {
						name: "Nothing",
						value: 0
					}],
					onChange: ({
						value
					}) => Settings.set("contextmenu", value),
					value: settings.contextmenu
				}), React.createElement(SettingsDivider, {
					className: Margins.marginTop20
				})), React.createElement(SettingsItem, {
					title: "Middle Click",
					className: Margins.marginTop20
				}, React.createElement(SettingsNote, {
					className: Margins.marginBottom8,
					type: "description"
				}, "What opens when middle clicking on the username."), React.createElement(RadioGroup, {
					options: [{
						name: "Settings",
						value: 1
					}, {
						name: "Settings Context Menu (Default)",
						value: 2
					}, {
						name: "Status Picker",
						value: 3
					}, {
						name: "Nothing",
						value: 0
					}],
					onChange: ({
						value
					}) => Settings.set("middleclick", value),
					value: settings.middleclick
				}), React.createElement(SettingsDivider, {
					className: Margins.marginTop20
				})), React.createElement(SwitchItem, {
					className: Margins.marginTop20,
					children: "Tooltip",
					note: "Show tooltip when hovering over user avatar.",
					onChange: v => Settings.set("showTooltip", v),
					value: settings.showTooltip
				}))
			}
			var src_React = __webpack_require__(113);
			const {
				Filters: {
					byProps: src_byProps
				},
				getModule: src_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const UserSettingsWindow = src_getModule(src_byProps("saveAccountChanges"));
			const Sections = src_getModule(src_byProps("ACCOUNT"));
			const accountClasses = src_getModule(src_byProps("buildOverrideButton"));
			const tooltipClasses = src_getModule(src_byProps("tooltipContent"));
			const layerContainerClass = src_getModule(src_byProps("layerContainer")).layerContainer;
			const appClass = src_getModule(src_byProps("appDevToolsWrapper")).app;
			const settingsSelector = `.${accountClasses.container} button:nth-last-child(1)`;
			class Tooltip {
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
						this.target.removeEventListener("mouseleave", hide)
					}
				}
				show() {
					this.ref = this.tooltip.cloneNode(true);
					this.layerContainer.appendChild(this.ref);
					const targetRect = this.target.getBoundingClientRect();
					const tooltipRect = this.ref.getBoundingClientRect();
					this.ref.style.top = `${targetRect.top-tooltipRect.height-8}px`;
					this.ref.style.left = `${targetRect.left+targetRect.width/2-tooltipRect.width/2}px`;
					this.ref.style.opacity = "1";
					this.ref.style.transform = "none"
				}
				hide() {
					const ref = this.ref;
					ref.style.opacity = "0";
					ref.style.transform = "scale(0.95)";
					setTimeout((() => ref?.remove()), 100)
				}
				forceHide() {
					this.ref?.remove()
				}
				remove() {
					this.clearListeners();
					this.forceHide()
				}
			}
			class AvatarSettingsButton extends(external_BasePlugin_default()) {
				constructor() {
					super(...arguments);
					this.target = null;
					this.tooltip = null
				}
				onStart() {
					(0, external_BdApi_namespaceObject.injectCSS)("AvatarSettingsButton", `${settingsSelector} { display: none; }`);
					Settings.addListener((() => {
						this.addListeners();
						this.addTooltip()
					}));
					this.target = document.querySelector("." + accountClasses.avatarWrapper);
					this.addListeners();
					this.addTooltip()
				}
				observer({
					addedNodes
				}) {
					for (const node of addedNodes)
						if (node.className?.includes?.(accountClasses.avatarWrapper)) {
							this.target = node;
							this.addListeners();
							this.addTooltip()
						}
				}
				openPopout() {
					this.target.dispatchEvent(new MouseEvent("click", {
						bubbles: true
					}))
				}
				openSettings() {
					UserSettingsWindow.setSection(Sections.ACCOUNT);
					UserSettingsWindow.open();
					if (document.querySelector("#status-picker") || document.querySelector("#account")) this.openPopout()
				}
				openContextMenu(e) {
					document.querySelector(settingsSelector).dispatchEvent(new MouseEvent("contextmenu", {
						bubbles: true,
						clientX: e.clientX,
						clientY: screen.height - 12
					}));
					if (document.querySelector("#status-picker") || document.querySelector("#account")) this.openPopout()
				}
				addListeners() {
					if (!this.target) return;
					this.clearListeners?.();
					const actions = [null, this.openSettings.bind(this), this.openContextMenu.bind(this), this.openPopout.bind(this)];
					const clickAction = actions[Settings.get("click")];
					const click = e => {
						if (e.isTrusted) {
							e.preventDefault();
							e.stopPropagation();
							clickAction(e);
							this.tooltip?.forceHide()
						}
					};
					const contextmenuAction = actions[Settings.get("contextmenu")];
					const contextmenu = e => {
						contextmenuAction(e);
						this.tooltip?.forceHide()
					};
					const middleclickAction = actions[Settings.get("middleclick")];
					const middleclick = e => {
						if (1 === e.button) {
							middleclickAction(e);
							this.tooltip?.forceHide()
						}
					};
					this.target.addEventListener("click", click);
					this.target.addEventListener("contextmenu", contextmenu);
					this.target.addEventListener("mousedown", middleclick);
					this.clearListeners = () => {
						this.target.removeEventListener("click", click);
						this.target.removeEventListener("contextmenu", contextmenu);
						this.target.removeEventListener("mousedown", middleclick)
					}
				}
				addTooltip() {
					if (!this.target) return;
					this.tooltip?.remove();
					this.tooltip = null;
					if (!Settings.get("showTooltip")) return;
					const click = Settings.get("click");
					if (0 === click) return;
					const tooltips = ["", "User Settings", "Settings Shortcuts", "Set Status"];
					this.tooltip = new Tooltip(this.target, tooltips[click])
				}
				onStop() {
					(0, external_BdApi_namespaceObject.clearCSS)("AvatarSettingsButton");
					Settings.clearListeners();
					this.clearListeners?.();
					this.tooltip?.remove();
					this.target = null;
					this.tooltip = null
				}
				getSettingsPanel() {
					return src_React.createElement(SettingsPanel, null)
				}
			}
		})();
		Plugin = __webpack_exports__
	})();

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class {
	start() {};
	stop() {}
};

/*@end@*/