/**
 * @name VoiceActivity
 * @author Neodymium
 * @description Shows icons and info in popouts, the member list, and more when someone is in a voice channel.
 * @version 1.5.4
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/VoiceActivity/VoiceActivity.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/VoiceActivity/VoiceActivity.plugin.js
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
		name: "VoiceActivity",
		authors: [{
			name: "Neodymium",
		}],
		version: "1.5.4",
		description: "Shows icons and info in popouts, the member list, and more when someone is in a voice channel.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/VoiceActivity/VoiceActivity.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/VoiceActivity/VoiceActivity.plugin.js"
	},
	changelog: [{
		title: "Fixed",
		type: "fixed",
		items: ["Fixed popout section sometimes not being displayed."]
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
			128: (module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(703);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(882);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(268);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default());
				___CSS_LOADER_EXPORT___.push([module.id, ".VoiceActivity-guildimage-defaultIcon{display:flex;align-items:center;justify-content:center;font-weight:500;line-height:1.2em;white-space:nowrap;background-color:var(--background-primary);color:var(--text-normal);min-width:48px;width:48px;height:48px;border-radius:16px;cursor:pointer;white-space:nowrap;overflow:hidden}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					defaultIcon: "VoiceActivity-guildimage-defaultIcon"
				};
				(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("guildimage.scss", ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = {
					...___CSS_LOADER_EXPORT___.locals,
					_content: ___CSS_LOADER_EXPORT___.toString()
				}
			},
			567: (module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(703);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(882);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(268);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default());
				___CSS_LOADER_EXPORT___.push([module.id, ".VoiceActivity-voiceicon-icon{height:20px;width:20px;min-width:20px;border-radius:50%;background-color:var(--background-floating);cursor:pointer}.VoiceActivity-voiceicon-icon:hover{background-color:var(--background-tertiary)}.VoiceActivity-voiceicon-icon svg{padding:3px;color:var(--interactive-normal)}.VoiceActivity-voiceicon-iconCurrentCall{background-color:var(--status-positive)}.VoiceActivity-voiceicon-iconCurrentCall:hover{background-color:var(--button-positive-background)}.VoiceActivity-voiceicon-iconCurrentCall svg{color:#fff}.VoiceActivity-voiceicon-iconLive{height:16px;border-radius:16px;background-color:var(--status-danger);color:#fff;font-size:12px;line-height:16px;font-weight:600;font-family:var(--font-display);text-transform:uppercase}.VoiceActivity-voiceicon-iconLive:hover{background-color:var(--button-danger-background)}.VoiceActivity-voiceicon-iconLive>div{padding:0 6px}.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-header{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext{display:flex;flex-direction:row;margin-top:3px}.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext>div{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-tooltipIcon{min-width:16px;margin-right:3px;color:var(--interactive-normal)}.VoiceActivity-voiceicon-iconContainer{margin-left:auto}.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-icon{margin-right:8px}.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-iconLive{margin-right:8px}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					icon: "VoiceActivity-voiceicon-icon",
					iconCurrentCall: "VoiceActivity-voiceicon-iconCurrentCall",
					iconLive: "VoiceActivity-voiceicon-iconLive",
					tooltip: "VoiceActivity-voiceicon-tooltip",
					header: "VoiceActivity-voiceicon-header",
					subtext: "VoiceActivity-voiceicon-subtext",
					tooltipIcon: "VoiceActivity-voiceicon-tooltipIcon",
					iconContainer: "VoiceActivity-voiceicon-iconContainer"
				};
				(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("voiceicon.scss", ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = {
					...___CSS_LOADER_EXPORT___.locals,
					_content: ___CSS_LOADER_EXPORT___.toString()
				}
			},
			998: (module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(703);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(882);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(268);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default());
				___CSS_LOADER_EXPORT___.push([module.id, ".VoiceActivity-voicepopoutsection-header{margin-bottom:8px;color:var(--header-primary);font-size:12px;line-height:16px;font-family:var(--font-display);font-weight:700;text-transform:uppercase}.VoiceActivity-voicepopoutsection-body{display:flex;flex-direction:row}.VoiceActivity-voicepopoutsection-text{margin:auto 10px;color:var(--text-normal);font-size:14px;line-height:18px;overflow:hidden}.VoiceActivity-voicepopoutsection-text>div,.VoiceActivity-voicepopoutsection-text>h3{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.VoiceActivity-voicepopoutsection-text>h3{font-family:var(--font-normal);font-weight:600}.VoiceActivity-voicepopoutsection-buttonWrapper{display:flex;flex:0 1 auto;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;margin-top:12px}.VoiceActivity-voicepopoutsection-buttonWrapper>div[aria-label]{width:32px;margin-left:8px}.VoiceActivity-voicepopoutsection-button{height:32px;min-height:32px;width:100%;display:flex;justify-content:center;align-items:center;padding:2px 16px;border-radius:3px;color:#fff;font-size:14px;line-height:16px;font-weight:500;user-select:none;background-color:var(--profile-gradient-button-color);transition:opacity .2s ease-in-out}.VoiceActivity-voicepopoutsection-button:hover{opacity:.8}.VoiceActivity-voicepopoutsection-button:active{opacity:.9}.VoiceActivity-voicepopoutsection-button:disabled{opacity:.5;cursor:not-allowed}.VoiceActivity-voicepopoutsection-joinWrapper .VoiceActivity-voicepopoutsection-joinButton{min-width:32px;max-width:32px;padding:0}.VoiceActivity-voicepopoutsection-joinWrapper .VoiceActivity-voicepopoutsection-joinButton:disabled{pointer-events:none}.VoiceActivity-voicepopoutsection-joinWrapperDisabled{cursor:not-allowed}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					header: "VoiceActivity-voicepopoutsection-header",
					body: "VoiceActivity-voicepopoutsection-body",
					text: "VoiceActivity-voicepopoutsection-text",
					buttonWrapper: "VoiceActivity-voicepopoutsection-buttonWrapper",
					button: "VoiceActivity-voicepopoutsection-button",
					joinWrapper: "VoiceActivity-voicepopoutsection-joinWrapper",
					joinButton: "VoiceActivity-voicepopoutsection-joinButton",
					joinWrapperDisabled: "VoiceActivity-voicepopoutsection-joinWrapperDisabled"
				};
				(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("voicepopoutsection.scss", ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = {
					...___CSS_LOADER_EXPORT___.locals,
					_content: ___CSS_LOADER_EXPORT___.toString()
				}
			},
			703: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					Z: () => styles,
					z: () => load
				});
				let _styles = "";

				function load(path, css) {
					_styles += `/* ${path} */\n${css}\n`
				}

				function styles() {
					return _styles
				}
			},
			268: module => {
				"use strict";
				module.exports = function(cssWithMappingToString) {
					var list = [];
					list.toString = function toString() {
						return this.map((function(item) {
							var content = "";
							var needLayer = "undefined" !== typeof item[5];
							if (item[4]) content += "@supports (".concat(item[4], ") {");
							if (item[2]) content += "@media ".concat(item[2], " {");
							if (needLayer) content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
							content += cssWithMappingToString(item);
							if (needLayer) content += "}";
							if (item[2]) content += "}";
							if (item[4]) content += "}";
							return content
						})).join("")
					};
					list.i = function i(modules, media, dedupe, supports, layer) {
						if ("string" === typeof modules) modules = [
							[null, modules, void 0]
						];
						var alreadyImportedModules = {};
						if (dedupe)
							for (var k = 0; k < this.length; k++) {
								var id = this[k][0];
								if (null != id) alreadyImportedModules[id] = true
							}
						for (var _k = 0; _k < modules.length; _k++) {
							var item = [].concat(modules[_k]);
							if (dedupe && alreadyImportedModules[item[0]]) continue;
							if ("undefined" !== typeof layer)
								if ("undefined" === typeof item[5]) item[5] = layer;
								else {
									item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
									item[5] = layer
								} if (media)
								if (!item[2]) item[2] = media;
								else {
									item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
									item[2] = media
								} if (supports)
								if (!item[4]) item[4] = "".concat(supports);
								else {
									item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
									item[4] = supports
								} list.push(item)
						}
					};
					return list
				}
			},
			882: module => {
				"use strict";
				module.exports = function(i) {
					return i[1]
				}
			},
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
				id: moduleId,
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
				default: () => VoiceActivity
			});
			const external_BdApi_namespaceObject = BdApi;
			const external_Library_namespaceObject = Library;
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			var styles = __webpack_require__(703);
			var external_BdApi_React_ = __webpack_require__(113);
			const external_VoiceActivity_namespaceObject = "VoiceActivity";
			var external_VoiceActivity_default = __webpack_require__.n(external_VoiceActivity_namespaceObject);
			class SettingsManager {
				constructor(defaultSettings) {
					this.settings = (0, external_BdApi_namespaceObject.loadData)(external_VoiceActivity_default(), "settings");
					if (!this.settings) {
						(0, external_BdApi_namespaceObject.saveData)(external_VoiceActivity_default(), "settings", defaultSettings);
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
					(0, external_BdApi_namespaceObject.saveData)(external_VoiceActivity_default(), "settings", this.settings);
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
			const Dispatcher = Library ? Library.DiscordModules.Dispatcher : external_BdApi_namespaceObject.Webpack.getModule(external_BdApi_namespaceObject.Webpack.Filters.byProps("dispatch", "subscribe"));
			const LocaleManager = Library ? Library.DiscordModules.LocaleManager : external_BdApi_namespaceObject.Webpack.getModule((m => m.Messages?.CLOSE));
			class StringsManager {
				constructor(locales, defaultLocale) {
					this.locales = locales;
					this.defaultLocale = defaultLocale || "en-US";
					this.setLocale = this.setLocale.bind(this)
				}
				setLocale() {
					this.strings = this.locales[LocaleManager.getLocale()] || this.locales[this.defaultLocale]
				}
				subscribe() {
					this.setLocale();
					Dispatcher.subscribe("I18N_LOAD_SUCCESS", this.setLocale)
				}
				get(key) {
					return this.strings[key] || this.locales[this.defaultLocale][key]
				}
				unsubscribe() {
					Dispatcher.unsubscribe("I18N_LOAD_SUCCESS", this.setLocale)
				}
			}
			const locales_namespaceObject = JSON.parse('{"en-US":{"SETTINGS_ICONS":"Member List Icons","SETTINGS_ICONS_NOTE":"Shows icons on the member list when someone is in a voice channel.","SETTINGS_DM_ICONS":"DM Icons","SETTINGS_DM_ICONS_NOTE":"Shows icons on the DM list when someone is in a voice channel.","SETTINGS_PEOPLE_ICONS":"Friends List Icons","SETTINGS_PEOPLE_ICONS_NOTE":"Shows icons on the DM list when someone is in a voice channel.","SETTINGS_COLOR":"Current Channel Icon Color","SETTINGS_COLOR_NOTE":"Makes the Member List icons green when the user is in your current voice channel.","SETTINGS_STATUS":"Show Status Icons","SETTINGS_STATUS_NOTE":"Changes the Member List icons when a user is Muted, Deafened, or has Video enabled.","SETTINGS_IGNORE":"Ignore","SETTINGS_IGNORE_NOTE":"Adds an option on Voice Channel and Guild context menus to ignore that channel/guild in Member List Icons and User Popouts.","CONTEXT_IGNORE":"Ignore in Voice Activity","VOICE_CALL":"Voice Call","PRIVATE_CALL":"Private Call","GROUP_CALL":"Group Call","LIVE":"Live","HEADER":"In a Voice Channel","HEADER_VOICE":"In a Voice Call","HEADER_PRIVATE":"In a Private Call","HEADER_GROUP":"In a Group Call","HEADER_STAGE":"In a Stage Channel","VIEW":"View Channel","VIEW_CALL":"View Call","JOIN":"Join Channel","JOIN_CALL":"Join Call","JOIN_DISABLED":"Already in Channel","JOIN_DISABLED_CALL":"Already in Call","JOIN_VIDEO":"Join With Video"}}');
			const default_group_icon_namespaceObject = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAABgmlDQ1BJQ0MgUHJvZmlsZQAAKM+VkTtIw1AYhb9WxQcVBzuIOGSoThZERRyliiIolFrB12CS2io0sSQtLo6Cq+DgY7Hq4OKsq4OrIAg+QBydnBRdROJ/U6FFqOCFcD/OzTnce34IFrOm5db2gGXnncRYTJuZndPqn6mlBmikTzfd3OTUaJKq6+OWgNpvoiqL/63m1JJrQkATHjJzTl54UXhgLZ9TvCscNpf1lPCpcLcjFxS+V7pR4hfFGZ+DKjPsJBPDwmFhLVPBRgWby44l3C8cSVm25AdnSpxSvK7YyhbMn3uqF4aW7OkppcvXwRjjTBJHw6DAClnyRGW3RXFJyHmsir/d98fFZYhrBVMcI6xioft+1Ax+d+um+3pLSaEY1D153lsn1G/D15bnfR563tcR1DzChV32rxZh8F30rbIWOYCWDTi7LGvGDpxvQttDTnd0X1LzD6bT8HoiY5qF1mtomi/19nPO8R0kpauJK9jbh66MZC9UeXdDZW9//uP3R+wbNjlyjzeozyoAAABgUExURVhl8oGK9LW7+erq/f///97i+7/F+mx38qGo92Ft8mFv8ujs/IuW9PP2/Wx384GM9Kux+MDF+urs/d/i+7S9+Jae9uDj/Jad9srO+tXY+4yU9aqy+MDE+qGn9/T1/neC9Liz/RcAAAAJcEhZcwAACxMAAAsTAQCanBgAAATqaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPg0KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmIzMjk5M2JmLTliZTUtNGJmMy04ZWEwLWY3ZDkzNTMyMTY2YiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNjhkOWE3MS1lYWU3LTRmZjAtYmMxZS04MGUwYmMxMTFkZDUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplZjU1ZGE0YS0wZTBhLTRjNTctODdmOC1lMmFmMGUyZGEzOGUiIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIiBHSU1QOkFQST0iMi4wIiBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIiBHSU1QOlRpbWVTdGFtcD0iMTY0ODk0NDg1NjM4ODc5MSIgR0lNUDpWZXJzaW9uPSIyLjEwLjI0IiB0aWZmOk9yaWVudGF0aW9uPSIxIiB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+DQogICAgICA8eG1wTU06SGlzdG9yeT4NCiAgICAgICAgPHJkZjpTZXE+DQogICAgICAgICAgPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ3NmFhOGE3LTVhNGEtNDcyNS05YTBjLWU1NzVmMzE1MzFmOCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIgc3RFdnQ6d2hlbj0iMjAyMi0wNC0wMlQxNzoxNDoxNiIgLz4NCiAgICAgICAgPC9yZGY6U2VxPg0KICAgICAgPC94bXBNTTpIaXN0b3J5Pg0KICAgIDwvcmRmOkRlc2NyaXB0aW9uPg0KICA8L3JkZjpSREY+DQo8L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9InIiPz6JoorbAAABV0lEQVRoQ+3W23KDIBAGYIOYBk20prWNPb7/W3Z3WQ9lGmeKe/l/N/+IzAYDggUAAAAAAMB/HVzpfXV8kIuTpp3gvHJ8WTcx7VRanlSBrs+aVubxMxn7RdNGq6VVR02Pmjb6WHjCQ+80baxmgDXUxA/FaSPWXUxtctOCVF2Z2uSmhauUnT1RU61p49cq9b6npoOmDV4yK7xN8G8abhfPsXIkq7MxfdGKOt0qBuOtoqjnZ3BcN9BmZ1qftP2L91cXt4ezJszCq7uVtENfytEN1ocZLZlRJ1iNQ2zvNHd6oyWfamLpd809wofWTBxllY6a+UJyFCzkPWsve9+35N9fG/k+nZySufjkveuTOvCuzZmp/WN+F1/859AjSuahLW0LD/2kmWdjBtiNunxr5kmOyhR/VfAk5H9dxDr3TX2kcw6psmHqI51zSJUNUx/pDAAAAAAAsKkofgB06RBbh+d86AAAAABJRU5ErkJggg==";
			const {
				Filters: {
					byProps,
					byStrings
				},
				getModule
			} = external_BdApi_namespaceObject.Webpack;
			const {
				Permissions,
				UserStore
			} = external_Library_namespaceObject.DiscordModules;
			const DiscordPermissions = getModule(byProps("VIEW_CREATOR_MONETIZATION_ANALYTICS"), {
				searchExports: true
			});
			const Settings = new SettingsManager({
				showMemberListIcons: true,
				showDMListIcons: true,
				showPeopleListIcons: true,
				currentChannelColor: true,
				showStatusIcons: true,
				ignoreEnabled: false,
				ignoredChannels: [],
				ignoredGuilds: []
			});
			const Strings = new StringsManager(locales_namespaceObject);
			const useStateFromStores = getModule(byStrings("useStateFromStores"));
			const transitionTo = getModule(byStrings("transitionTo -"), {
				searchExports: true
			});
			const VoiceStateStore = getModule(byProps("getVoiceStateForUser"));
			const GuildStore = getModule(byProps("getGuildCount"));
			const withProps = filter => m => Object.values(m).some(filter);

			function checkPermissions(channel) {
				return Permissions.can({
					permission: DiscordPermissions.VIEW_CHANNEL,
					user: UserStore.getCurrentUser(),
					context: channel
				})
			}

			function forceUpdateAll(selector) {
				document.querySelectorAll(selector).forEach((node => {
					external_Library_namespaceObject.ReactTools.getStateNodes(node).forEach((e => e.forceUpdate()))
				}))
			}

			function getIconFontSize(name) {
				const words = name.split(" ");
				if (words.length > 7) return 10;
				else if (6 === words.length) return 12;
				else if (5 === words.length) return 14;
				else return 16
			}

			function getImageLink(guild, channel) {
				let image;
				if (guild && guild.icon) image = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`;
				else if (channel.icon) image = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
				else if (3 === channel.type) image = default_group_icon_namespaceObject;
				return image
			}

			function groupDMName(members) {
				if (1 === members.length) return UserStore.getUser(members[0]).username;
				else if (members.length > 1) {
					let name = "";
					for (let i = 0; i < members.length; i++)
						if (i === members.length - 1) name += UserStore.getUser(members[i]).username;
						else name += UserStore.getUser(members[i]).username + ", ";
					return name
				}
				return "Unnamed"
			}
			var voiceiconmodule = __webpack_require__(567);
			const {
				Filters: {
					byPrototypeFields
				},
				getModule: Tooltip_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const Tooltip = Tooltip_getModule(byPrototypeFields("renderTooltip"));
			const components_Tooltip = Tooltip;
			const {
				Filters: {
					byStrings: icons_byStrings
				},
				getModule: icons_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const CallJoin = icons_getModule(icons_byStrings("M11 5V3C16.515 3 21 7.486"));
			const People = icons_getModule(icons_byStrings("M14 8.00598C14 10.211 12.206 12.006"));
			const Speaker = icons_getModule(icons_byStrings("M11.383 3.07904C11.009 2.92504 10.579 3.01004"));
			const Muted = icons_getModule(icons_byStrings("M6.7 11H5C5 12.19 5.34 13.3"));
			const Deafened = icons_getModule(icons_byStrings("M6.16204 15.0065C6.10859 15.0022 6.05455 15"));
			const Video = icons_getModule(icons_byStrings("M21.526 8.149C21.231 7.966 20.862 7.951"));
			const Stage = icons_getModule(icons_byStrings("M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"));
			var React = __webpack_require__(113);
			const {
				ChannelStore,
				UserStore: VoiceIcon_UserStore
			} = external_Library_namespaceObject.DiscordModules;

			function VoiceIcon(props) {
				const {
					showMemberListIcons,
					showDMListIcons,
					showPeopleListIcons,
					ignoreEnabled,
					ignoredChannels,
					ignoredGuilds,
					currentChannelColor,
					showStatusIcons
				} = Settings.useSettingsState();
				const voiceState = useStateFromStores([VoiceStateStore], (() => VoiceStateStore.getVoiceStateForUser(props.userId)));
				const currentUserVoiceState = useStateFromStores([VoiceStateStore], (() => VoiceStateStore.getVoiceStateForUser(VoiceIcon_UserStore.getCurrentUser()?.id)));
				if ("memberlist" === props.context && !showMemberListIcons) return null;
				if ("dmlist" === props.context && !showDMListIcons) return null;
				if ("peoplelist" === props.context && !showPeopleListIcons) return null;
				if (!voiceState) return null;
				const channel = ChannelStore.getChannel(voiceState.channelId);
				if (!channel) return null;
				const guild = GuildStore.getGuild(channel.guild_id);
				if (guild && !checkPermissions(channel)) return null;
				if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;
				let text;
				let subtext;
				let TooltipIcon;
				let channelPath;
				let className = voiceiconmodule.Z.icon;
				if (channel.id === currentUserVoiceState?.channelId && currentChannelColor) className = `${voiceiconmodule.Z.icon} ${voiceiconmodule.Z.iconCurrentCall}`;
				if (voiceState.selfStream) className = voiceiconmodule.Z.iconLive;
				if (guild) {
					text = guild.name;
					subtext = channel.name;
					TooltipIcon = Speaker;
					channelPath = `/channels/${guild.id}/${channel.id}`
				} else {
					text = channel.name;
					subtext = Strings.get("VOICE_CALL");
					TooltipIcon = CallJoin;
					channelPath = `/channels/@me/${channel.id}`
				}
				switch (channel.type) {
					case 1:
						text = VoiceIcon_UserStore.getUser(channel.recipients[0]).username;
						subtext = Strings.get("PRIVATE_CALL");
						break;
					case 3:
						text = channel.name ?? groupDMName(channel.recipients);
						subtext = Strings.get("GROUP_CALL");
						TooltipIcon = People;
						break;
					case 13:
						TooltipIcon = Stage
				}
				let Icon = Speaker;
				if (showStatusIcons && (voiceState.selfDeaf || voiceState.deaf)) Icon = Deafened;
				else if (showStatusIcons && (voiceState.selfMute || voiceState.mute)) Icon = Muted;
				else if (showStatusIcons && voiceState.selfVideo) Icon = Video;
				return React.createElement("div", {
					className,
					onClick: e => {
						e.stopPropagation();
						e.preventDefault();
						if (channelPath) transitionTo(channelPath)
					}
				}, React.createElement(components_Tooltip, {
					text: React.createElement("div", {
						className: voiceiconmodule.Z.tooltip
					}, React.createElement("div", {
						className: voiceiconmodule.Z.header,
						style: {
							fontWeight: "600"
						}
					}, text), React.createElement("div", {
						className: voiceiconmodule.Z.subtext
					}, React.createElement(TooltipIcon, {
						className: voiceiconmodule.Z.tooltipIcon,
						width: "16",
						height: "16"
					}), React.createElement("div", {
						style: {
							fontWeight: "400"
						}
					}, subtext)))
				}, (props2 => React.createElement("div", {
					...props2
				}, !voiceState.selfStream ? React.createElement(Icon, {
					width: "14",
					height: "14"
				}) : Strings.get("LIVE")))))
			}
			var voicepopoutsectionmodule = __webpack_require__(998);
			var guildimagemodule = __webpack_require__(128);
			var GuildImage_React = __webpack_require__(113);
			const {
				Filters: {
					byStrings: GuildImage_byStrings
				},
				getModule: GuildImage_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const {
				GuildActions
			} = external_Library_namespaceObject.DiscordModules;
			const getAcronym = GuildImage_getModule(GuildImage_byStrings(`.replace(/'s /g," ").replace(/\\w+/g,`), {
				searchExports: true
			});

			function GuildImage(props) {
				const image = getImageLink(props.guild, props.channel);
				if (image) return GuildImage_React.createElement("img", {
					className: guildimagemodule.Z.icon,
					src: image,
					width: "48",
					height: "48",
					style: {
						borderRadius: "16px",
						cursor: "pointer"
					},
					onClick: () => {
						if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
						else if (props.channelPath) transitionTo(props.channelPath)
					}
				});
				else return GuildImage_React.createElement("div", {
					className: guildimagemodule.Z.defaultIcon,
					onClick: () => {
						if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
						else if (props.channelPath) transitionTo(props.channelPath)
					},
					style: {
						fontSize: `${getIconFontSize(props.guild?props.guild.name:props.channel.name)}px`
					}
				}, getAcronym(props.guild ? props.guild.name : props.guild.id))
			}
			var VoicePopoutSection_React = __webpack_require__(113);
			const {
				getModule: VoicePopoutSection_getModule,
				Filters: {
					byStrings: VoicePopoutSection_byStrings
				}
			} = external_BdApi_namespaceObject.Webpack;
			const {
				ChannelActions,
				ChannelStore: VoicePopoutSection_ChannelStore,
				SelectedChannelStore,
				UserStore: VoicePopoutSection_UserStore
			} = external_Library_namespaceObject.DiscordModules;
			const UserPopoutSection = VoicePopoutSection_getModule(VoicePopoutSection_byStrings(".lastSection", ".children"));

			function VoicePopoutSection(props) {
				const {
					ignoreEnabled,
					ignoredChannels,
					ignoredGuilds
				} = Settings.useSettingsState();
				const voiceState = useStateFromStores([VoiceStateStore], (() => VoiceStateStore.getVoiceStateForUser(props.userId)));
				const currentUserVoiceState = useStateFromStores([VoiceStateStore], (() => VoiceStateStore.getVoiceStateForUser(VoicePopoutSection_UserStore.getCurrentUser()?.id)));
				if (!voiceState) return null;
				const channel = VoicePopoutSection_ChannelStore.getChannel(voiceState.channelId);
				if (!channel) return null;
				const guild = GuildStore.getGuild(channel.guild_id);
				if (guild && !checkPermissions(channel)) return null;
				if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;
				let headerText;
				let text;
				let viewButton;
				let joinButton;
				let Icon;
				let channelPath;
				const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
				const channelSelected = channel.id === SelectedChannelStore.getChannelId();
				const isCurrentUser = props.userId === VoicePopoutSection_UserStore.getCurrentUser().id;
				if (guild) {
					headerText = Strings.get("HEADER");
					text = [VoicePopoutSection_React.createElement("h3", null, guild.name), VoicePopoutSection_React.createElement("div", null, channel.name)];
					viewButton = Strings.get("VIEW");
					joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED") : Strings.get("JOIN");
					Icon = Speaker;
					channelPath = `/channels/${guild.id}/${channel.id}`
				} else {
					headerText = Strings.get("HEADER_VOICE");
					text = VoicePopoutSection_React.createElement("h3", null, channel.name);
					viewButton = Strings.get("VIEW_CALL");
					joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED_CALL") : Strings.get("JOIN_CALL");
					Icon = CallJoin;
					channelPath = `/channels/@me/${channel.id}`
				}
				switch (channel.type) {
					case 1:
						headerText = Strings.get("HEADER_PRIVATE");
						break;
					case 3:
						headerText = Strings.get("HEADER_GROUP");
						text = VoicePopoutSection_React.createElement("h3", null, channel.name ?? groupDMName(channel.recipients));
						break;
					case 13:
						headerText = Strings.get("HEADER_STAGE");
						Icon = Stage
				}
				return VoicePopoutSection_React.createElement(UserPopoutSection, null, VoicePopoutSection_React.createElement("h3", {
					className: voicepopoutsectionmodule.Z.header
				}, headerText), !(1 === channel.type) && VoicePopoutSection_React.createElement("div", {
					className: voicepopoutsectionmodule.Z.body
				}, VoicePopoutSection_React.createElement(GuildImage, {
					guild,
					channel,
					channelPath
				}), VoicePopoutSection_React.createElement("div", {
					className: voicepopoutsectionmodule.Z.text
				}, text)), VoicePopoutSection_React.createElement("div", {
					className: voicepopoutsectionmodule.Z.buttonWrapper
				}, VoicePopoutSection_React.createElement("button", {
					className: voicepopoutsectionmodule.Z.button,
					disabled: channelSelected,
					onClick: () => {
						if (channelPath) transitionTo(channelPath)
					}
				}, viewButton), !isCurrentUser && VoicePopoutSection_React.createElement(components_Tooltip, {
					text: joinButton,
					position: "top"
				}, (props2 => VoicePopoutSection_React.createElement("div", {
					...props2,
					className: inCurrentChannel ? `${voicepopoutsectionmodule.Z.joinWrapper} ${voicepopoutsectionmodule.Z.joinWrapperDisabled}` : voicepopoutsectionmodule.Z.joinWrapper
				}, VoicePopoutSection_React.createElement("button", {
					className: `${voicepopoutsectionmodule.Z.button} ${voicepopoutsectionmodule.Z.joinButton}`,
					disabled: inCurrentChannel,
					onClick: () => {
						if (channel.id) ChannelActions.selectVoiceChannel(channel.id)
					},
					onContextMenu: e => {
						if (13 === channel.type) return;
						external_Library_namespaceObject.ContextMenu.openContextMenu(e, external_Library_namespaceObject.ContextMenu.buildMenu([{
							label: Strings.get("JOIN_VIDEO"),
							id: "voice-activity-join-with-video",
							action: () => {
								if (channel.id) ChannelActions.selectVoiceChannel(channel.id, true)
							}
						}]))
					}
				}, VoicePopoutSection_React.createElement(Icon, {
					width: "18",
					height: "18"
				})))))))
			}
			var SettingsPanel_React = __webpack_require__(113);
			const {
				getModule: SettingsPanel_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const SwitchItem = SettingsPanel_getModule((m => m.toString().includes("helpdeskArticleId")));
			const SettingsSwitchItem = props => {
				const [value, setValue] = (0, external_BdApi_React_.useState)(Settings.get(props.setting));
				return SettingsPanel_React.createElement(SwitchItem, {
					children: props.name,
					note: props.note,
					value,
					onChange: v => {
						setValue(v);
						Settings.set(props.setting, v)
					}
				})
			};

			function SettingsPanel() {
				const settings = {
					showMemberListIcons: {
						name: Strings.get("SETTINGS_ICONS"),
						note: Strings.get("SETTINGS_ICONS_NOTE")
					},
					showDMListIcons: {
						name: Strings.get("SETTINGS_DM_ICONS"),
						note: Strings.get("SETTINGS_DM_ICONS_NOTE")
					},
					showPeopleListIcons: {
						name: Strings.get("SETTINGS_PEOPLE_ICONS"),
						note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE")
					},
					currentChannelColor: {
						name: Strings.get("SETTINGS_COLOR"),
						note: Strings.get("SETTINGS_COLOR_NOTE")
					},
					showStatusIcons: {
						name: Strings.get("SETTINGS_STATUS"),
						note: Strings.get("SETTINGS_STATUS_NOTE")
					},
					ignoreEnabled: {
						name: Strings.get("SETTINGS_IGNORE"),
						note: Strings.get("SETTINGS_IGNORE_NOTE")
					}
				};
				return SettingsPanel_React.createElement(SettingsPanel_React.Fragment, null, Object.keys(settings).map((key => {
					const {
						name,
						note
					} = settings[key];
					return SettingsPanel_React.createElement(SettingsSwitchItem, {
						setting: key,
						name,
						note
					})
				})))
			}
			var src_React = __webpack_require__(113);
			const {
				Filters: {
					byProps: src_byProps,
					byStrings: src_byStrings
				},
				getModule: src_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const memberItemSelector = `.${src_getModule(src_byProps("member","activity")).member}`;
			const privateChannelSelector = `.${src_getModule(src_byProps("channel","activity")).channel}`;
			const peopleItemSelector = `.${src_getModule(src_byProps("peopleListItem")).peopleListItem}`;
			const children = src_getModule(src_byProps("avatar", "children")).children;
			class VoiceActivity extends(external_BasePlugin_default()) {
				onStart() {
					this.contextMenuUnpatches = new Set;
					(0, external_BdApi_namespaceObject.injectCSS)("VoiceActivity", (0, styles.Z)() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`);
					Strings.subscribe();
					this.patchUserPopout();
					this.patchMemberListItem();
					this.patchPrivateChannel();
					this.patchPeopleListItem();
					this.patchChannelContextMenu();
					this.patchGuildContextMenu()
				}
				patchUserPopout() {
					const UserPopoutBody = src_getModule(withProps(src_byStrings(".showCopiableUsername")));
					external_BdApi_namespaceObject.Patcher.after("VoiceActivity", UserPopoutBody, "Z", ((_, [props], ret) => {
						const popoutSections = ret.props.children[1].props.children[2].props.children;
						const activitySectionIndex = popoutSections.findIndex((section => section.props.hasOwnProperty("activity")));
						popoutSections.splice(activitySectionIndex, 0, src_React.createElement(VoicePopoutSection, {
							userId: props.user.id
						}))
					}))
				}
				async patchMemberListItem() {
					const MemberListItem = await external_Library_namespaceObject.ReactComponents.getComponent("MemberListItem", memberItemSelector, (c => c.prototype?.renderPremium));
					external_BdApi_namespaceObject.Patcher.after("VoiceActivity", MemberListItem.component.prototype, "render", ((thisObject, _, ret) => {
						if (thisObject.props.user) Array.isArray(ret.props.children) ? ret.props.children.unshift(src_React.createElement(VoiceIcon, {
							userId: thisObject.props.user.id,
							context: "memberlist"
						})) : ret.props.children = [src_React.createElement(VoiceIcon, {
							userId: thisObject.props.user.id,
							context: "memberlist"
						})]
					}));
					forceUpdateAll(memberItemSelector)
				}
				async patchPrivateChannel() {
					const PrivateChannel = await external_Library_namespaceObject.ReactComponents.getComponent("PrivateChannel", privateChannelSelector, (c => c.prototype?.renderSubtitle));
					external_BdApi_namespaceObject.Patcher.after("VoiceActivity", PrivateChannel.component.prototype, "render", ((thisObject, _, ret) => {
						if (!thisObject.props.user) return;
						const props = external_Library_namespaceObject.Utilities.findInTree(ret, (e => e?.children && e?.id), {
							walkable: ["children", "props"]
						});
						const children2 = props.children;
						props.children = childrenProps => {
							const childrenRet = children2(childrenProps);
							const privateChannel = external_Library_namespaceObject.Utilities.findInTree(childrenRet, (e => e?.children?.props?.avatar), {
								walkable: ["children", "props"]
							});
							privateChannel.children = [privateChannel.children, src_React.createElement("div", {
								className: voiceiconmodule.Z.iconContainer
							}, src_React.createElement(VoiceIcon, {
								userId: thisObject.props.user.id,
								context: "dmlist"
							}))];
							return childrenRet
						}
					}));
					forceUpdateAll(privateChannelSelector)
				}
				async patchPeopleListItem() {
					const PeopleListItem = await external_Library_namespaceObject.ReactComponents.getComponent("PeopleListItem", peopleItemSelector, (c => c.prototype?.componentWillEnter));
					external_BdApi_namespaceObject.Patcher.after("VoiceActivity", PeopleListItem.component.prototype, "render", ((thisObject, _, ret) => {
						if (!thisObject.props.user) return;
						const children2 = ret.props.children;
						ret.props.children = childrenProps => {
							const childrenRet = children2(childrenProps);
							childrenRet.props.children.props.children.props.children.splice(1, 0, src_React.createElement("div", {
								className: voiceiconmodule.Z.iconContainer
							}, src_React.createElement(VoiceIcon, {
								userId: thisObject.props.user.id,
								context: "peoplelist"
							})));
							return childrenRet
						}
					}));
					forceUpdateAll(peopleItemSelector)
				}
				async patchChannelContextMenu() {
					const unpatch = external_BdApi_namespaceObject.ContextMenu.patch("channel-context", ((ret, props) => {
						if (!Settings.get("ignoreEnabled")) return ret;
						const {
							ignoredChannels
						} = Settings.useSettingsState();
						const ignored = ignoredChannels.includes(props.channel.id);
						const menuItem = external_BdApi_namespaceObject.ContextMenu.buildItem({
							type: "toggle",
							label: Strings.get("CONTEXT_IGNORE"),
							id: "voiceactivity-ignore",
							checked: ignored,
							action: () => {
								if (ignored) {
									const newIgnoredChannels = ignoredChannels.filter((id => id !== props.channel.id));
									Settings.set("ignoredChannels", newIgnoredChannels)
								} else {
									const newIgnoredChannels = [...ignoredChannels, props.channel.id];
									Settings.set("ignoredChannels", newIgnoredChannels)
								}
							}
						});
						ret.props.children[3].props.children.splice(2, 0, menuItem)
					}));
					this.contextMenuUnpatches.add(unpatch)
				}
				async patchGuildContextMenu() {
					const unpatch = external_BdApi_namespaceObject.ContextMenu.patch("guild-context", ((ret, props) => {
						if (!Settings.get("ignoreEnabled")) return ret;
						const {
							ignoredGuilds
						} = Settings.useSettingsState();
						const ignored = ignoredGuilds.includes(props.guild.id);
						const menuItem = external_BdApi_namespaceObject.ContextMenu.buildItem({
							type: "toggle",
							label: Strings.get("CONTEXT_IGNORE"),
							id: "voiceactivity-ignore",
							checked: ignored,
							action: () => {
								if (ignored) {
									const newIgnoredGuilds = ignoredGuilds.filter((id => id !== props.guild.id));
									Settings.set("ignoredGuilds", newIgnoredGuilds)
								} else {
									const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
									Settings.set("ignoredGuilds", newIgnoredGuilds)
								}
							}
						});
						ret.props.children[2].props.children.push(menuItem)
					}));
					this.contextMenuUnpatches.add(unpatch)
				}
				onStop() {
					(0, external_BdApi_namespaceObject.clearCSS)("VoiceActivity");
					external_BdApi_namespaceObject.Patcher.unpatchAll("VoiceActivity");
					Strings.unsubscribe();
					this.contextMenuUnpatches.forEach((unpatch => unpatch()));
					this.contextMenuUnpatches.clear();
					forceUpdateAll(memberItemSelector);
					forceUpdateAll(privateChannelSelector);
					forceUpdateAll(peopleItemSelector)
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