/**
 * @name ActivityIcons
 * @author Neodymium
 * @description Improves the default icons next to statuses
 * @version 1.2.8
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityIcons/ActivityIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/ActivityIcons/ActivityIcons.plugin.js
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
		name: "ActivityIcons",
		authors: [{
			name: "Neodymium",
		}],
		version: "1.2.8",
		description: "Improves the default icons next to statuses",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityIcons/ActivityIcons.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/ActivityIcons/ActivityIcons.plugin.js"
	},
	changelog: [{
		title: "Fixed",
		type: "fixed",
		items: ["Fixed compatibility with Discord's latest update."]
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
			161: (module, __webpack_exports__, __webpack_require__) => {
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
				___CSS_LOADER_EXPORT___.push([module.id, ".activity-icon {\n\twidth: 16px;\n\theight: 16px;\n\tmargin-left: 4px;\n\t-webkit-box-flex: 0;\n\tflex: 0 0 auto;\n}\n.activity-icon-small {\n\tmargin: 1px;\n}\n.rich-activity-icon {\n\tmargin-left: 2px;\n\tmargin-right: -2px;\n}\n.activity-icon > div {\n\twidth: inherit;\n\theight: inherit;\n}\n", ""]);
				(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("styles.css", ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = ___CSS_LOADER_EXPORT___.toString()
			},
			703: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
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
				default: () => ActivityIcons
			});
			const external_BdApi_namespaceObject = BdApi;
			const external_Library_namespaceObject = Library;
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			var external_BdApi_React_ = __webpack_require__(113);
			const external_ActivityIcons_namespaceObject = "ActivityIcons";
			var external_ActivityIcons_default = __webpack_require__.n(external_ActivityIcons_namespaceObject);
			class SettingsManager {
				constructor(defaultSettings) {
					this.settings = (0, external_BdApi_namespaceObject.loadData)(external_ActivityIcons_default(), "settings");
					if (!this.settings) {
						(0, external_BdApi_namespaceObject.saveData)(external_ActivityIcons_default(), "settings", defaultSettings);
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
					(0, external_BdApi_namespaceObject.saveData)(external_ActivityIcons_default(), "settings", this.settings);
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
				normalIconBehavior: 0
			});
			const withProps = filter => m => Object.values(m).some(filter);

			function forceUpdateAll(selector) {
				document.querySelectorAll(selector).forEach((node => {
					external_Library_namespaceObject.ReactTools.getStateNodes(node).forEach((e => e.forceUpdate()))
				}))
			}
			var styles = __webpack_require__(161);
			var React = __webpack_require__(113);
			const SvgPlaystation = props => React.createElement("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 24 24",
				...props
			}, React.createElement("path", {
				d: "M23.669 17.155c-.464.586-1.602 1.004-1.602 1.004l-8.459 3.038v-2.24l6.226-2.219c.706-.253.815-.61.24-.798-.573-.189-1.61-.135-2.318.12l-4.148 1.46v-2.325l.24-.081s1.198-.424 2.884-.611c1.685-.186 3.749.025 5.369.64 1.826.576 2.031 1.427 1.568 2.012Zm-9.255-3.815V7.61c0-.673-.124-1.293-.756-1.468-.483-.155-.783.294-.783.966v14.35l-3.87-1.228V3.12c1.645.305 4.042 1.028 5.331 1.462 3.277 1.125 4.389 2.526 4.389 5.681 0 3.076-1.899 4.242-4.311 3.077Zm-12.51 5.382C.028 18.194-.284 17.094.571 16.461c.79-.585 2.132-1.025 2.132-1.025l5.549-1.974v2.25L4.26 17.14c-.706.253-.814.611-.241.8.574.187 1.612.134 2.318-.12l1.916-.695v2.012c-.122.022-.257.043-.382.064a12.556 12.556 0 0 1-5.968-.48Z",
				fill: "currentColor"
			}));
			const playstation = SvgPlaystation;
			var xbox_React = __webpack_require__(113);
			const SvgXbox = props => xbox_React.createElement("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 24 24",
				...props
			}, xbox_React.createElement("path", {
				d: "M11.004 21.959c-1.54-.147-3.099-.7-4.44-1.575-1.124-.733-1.378-1.033-1.378-1.635 0-1.206 1.329-3.32 3.598-5.727 1.29-1.368 3.086-2.972 3.28-2.93.378.085 3.397 3.03 4.527 4.413 1.789 2.194 2.612 3.989 2.194 4.789-.318.608-2.287 1.796-3.733 2.251-1.193.378-2.76.538-4.048.413Zm-7.333-4.462c-.932-1.43-1.404-2.84-1.633-4.877-.075-.673-.049-1.057.172-2.439.273-1.72 1.252-3.71 2.431-4.937.503-.522.548-.535 1.16-.328.743.25 1.535.797 2.765 1.91l.719.648-.392.482c-1.822 2.234-3.742 5.401-4.465 7.36-.394 1.064-.552 2.134-.383 2.578.113.3.009.19-.374-.397Zm16.375.242c.091-.449-.024-1.275-.298-2.108-.59-1.803-2.567-5.161-4.383-7.442l-.572-.717.619-.569c.807-.741 1.368-1.186 1.973-1.56.479-.298 1.16-.56 1.453-.56.18 0 .817.659 1.33 1.38.797 1.116 1.382 2.47 1.678 3.878.192.911.207 2.859.031 3.765-.144.744-.451 1.71-.75 2.367-.224.491-.78 1.444-1.025 1.755-.125.155-.125.155-.056-.19ZM11.17 4.44c-.839-.426-2.131-.881-2.846-1.006a5.333 5.333 0 0 0-.95-.053c-.59.029-.562 0 .383-.446a9.717 9.717 0 0 1 2.332-.775c1.001-.211 2.881-.214 3.867-.005 1.063.225 2.316.69 3.021 1.124l.21.129-.482-.025c-.956-.049-2.349.338-3.846 1.066-.452.22-.844.396-.872.389a15.527 15.527 0 0 1-.817-.398Z",
				fill: "currentColor"
			}));
			const xbox = SvgXbox;
			var ActivityIcon_React = __webpack_require__(113);
			const {
				Filters: {
					byPrototypeFields,
					byStrings
				},
				getModule
			} = external_BdApi_namespaceObject.Webpack;
			const Activity = getModule(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"));
			const RichActivity = getModule(byStrings("M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"));
			const Tooltip = getModule(byPrototypeFields("renderTooltip"));
			const bot = ["created_at", "id", "name", "type", "url"];

			function ActivityIcon(props) {
				const {
					activities
				} = props;
				const {
					normalIconBehavior
				} = Settings.useSettingsState();
				const isBot = 1 === activities.length && 0 === activities[0].type && Object.keys(activities[0]).every(((value, i) => value === bot[i]));
				if (isBot || 0 === activities.length) return null;
				const normalActivities = props.activities.filter((activity => 0 === activity.type));
				const hasCustomStatus = props.activities.some((activity => 4 === activity.type && activity.state));
				const hasRP = normalActivities.some((activity => (activity.assets || activity.details) && !activity.platform));
				const onPS = normalActivities.some((activity => "ps5" === activity.platform || "ps4" === activity.platform));
				const onXbox = normalActivities.some((activity => "xbox" === activity.platform));
				if (0 === normalActivities.length) return null;
				if (2 === normalIconBehavior && !(hasRP || onPS || onXbox)) return null;
				if (1 === normalIconBehavior && !hasCustomStatus && !(hasRP || onPS || onXbox)) return null;
				let tooltip;
				if (1 === normalActivities.length && hasCustomStatus) tooltip = ActivityIcon_React.createElement("strong", null, normalActivities[0].name);
				else if (2 === normalActivities.length) tooltip = ActivityIcon_React.createElement(ActivityIcon_React.Fragment, null, ActivityIcon_React.createElement("strong", null, normalActivities[0].name), " and ", ActivityIcon_React.createElement("strong", null, normalActivities[1].name));
				else if (3 === normalActivities.length) tooltip = ActivityIcon_React.createElement(ActivityIcon_React.Fragment, null, ActivityIcon_React.createElement("strong", null, normalActivities[0].name), ", ", ActivityIcon_React.createElement("strong", null, normalActivities[1].name), " and", " ", ActivityIcon_React.createElement("strong", null, normalActivities[2].name));
				else if (normalActivities.length > 3) tooltip = ActivityIcon_React.createElement(ActivityIcon_React.Fragment, null, ActivityIcon_React.createElement("strong", null, normalActivities[0].name), ", ", ActivityIcon_React.createElement("strong", null, normalActivities[1].name), " and", " ", normalActivities.length - 2, " more");
				let icon = ActivityIcon_React.createElement(Activity, {
					width: "16",
					height: "16"
				});
				if (onPS) icon = ActivityIcon_React.createElement(playstation, {
					width: "14",
					height: "14",
					className: "activity-icon-small"
				});
				if (onXbox) icon = ActivityIcon_React.createElement(xbox, {
					width: "14",
					height: "14",
					className: "activity-icon-small"
				});
				if (hasRP) icon = ActivityIcon_React.createElement(RichActivity, {
					width: "16",
					height: "16"
				});
				return tooltip ? ActivityIcon_React.createElement(Tooltip, {
					text: tooltip,
					position: "top"
				}, (props2 => ActivityIcon_React.createElement("div", {
					...props2,
					className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon"
				}, icon))) : ActivityIcon_React.createElement("div", {
					className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon"
				}, icon)
			}
			var ListeningIcon_React = __webpack_require__(113);
			const {
				Filters: {
					byPrototypeFields: ListeningIcon_byPrototypeFields,
					byStrings: ListeningIcon_byStrings
				},
				getModule: ListeningIcon_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const Headset = ListeningIcon_getModule(ListeningIcon_byStrings("M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"));
			const ListeningIcon_Tooltip = ListeningIcon_getModule(ListeningIcon_byPrototypeFields("renderTooltip"));

			function ListeningIcon(props) {
				const activity = props.activities.filter((activity2 => 2 === activity2.type))[0];
				if (!activity) return null;
				return ListeningIcon_React.createElement(ListeningIcon_Tooltip, {
					text: ListeningIcon_React.createElement(ListeningIcon_React.Fragment, null, ListeningIcon_React.createElement("div", {
						style: {
							fontWeight: "600"
						}
					}, activity.details), activity.state && ListeningIcon_React.createElement("div", {
						style: {
							fontWeight: "400"
						}
					}, `by ${activity.state.replace(/;/g,",")}`)),
					position: "top"
				}, (props2 => ListeningIcon_React.createElement("div", {
					...props2,
					className: "activity-icon"
				}, ListeningIcon_React.createElement(Headset, {
					className: "activity-icon-small",
					width: "14",
					height: "14"
				}))))
			}
			var SettingsPanel_React = __webpack_require__(113);
			const {
				getModule: SettingsPanel_getModule,
				Filters: {
					byProps
				}
			} = external_BdApi_namespaceObject.Webpack;
			const Margins = SettingsPanel_getModule(byProps("marginXSmall"));
			const RadioGroup = SettingsPanel_getModule((m => m.Sizes && m.toString().includes("radioItemClassName")));
			const SettingsItem = SettingsPanel_getModule((m => m.Tags && m.toString().includes("required")));
			const SettingsNote = SettingsPanel_getModule((m => m.Types && m.toString().includes("selectable")));

			function SettingsPanel() {
				const settings = Settings.useSettingsState();
				return SettingsPanel_React.createElement(SettingsPanel_React.Fragment, null, SettingsPanel_React.createElement(SettingsItem, {
					title: "Normal Activity Icon Behavior"
				}, SettingsPanel_React.createElement(SettingsNote, {
					className: Margins.marginBottom8,
					type: "description"
				}, "Conditions under which normal activity icon (game controller) will be displayed"), SettingsPanel_React.createElement(RadioGroup, {
					options: [{
						name: "Normal Activity (Default)",
						value: 0
					}, {
						name: "Custom Status and Normal Activity",
						value: 1
					}, {
						name: "Never",
						value: 2
					}],
					onChange: ({
						value
					}) => Settings.set("normalIconBehavior", value),
					value: settings.normalIconBehavior
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
			const peopleListItem = `.${src_getModule(src_byProps("peopleListItem")).peopleListItem}`;
			const memberListItem = `${external_Library_namespaceObject.DiscordSelectors.MemberList.members} > div > div:not(:first-child)`;
			const privateChannel = `.${src_getModule(src_byProps("privateChannelsHeaderContainer")).scroller} > ul > li`;
			class ActivityIcons extends(external_BasePlugin_default()) {
				onStart() {
					(0, external_BdApi_namespaceObject.injectCSS)("ActivityIcons", styles.Z);
					this.patchActivityStatus()
				}
				patchActivityStatus() {
					const ActivityStatus = src_getModule(withProps(src_byStrings("applicationStream")));
					external_BdApi_namespaceObject.Patcher.after("ActivityIcons", ActivityStatus, "Z", ((_, [props], ret) => {
						if (ret) {
							ret.props.children[2] = null;
							ret.props.children.push(src_React.createElement(ActivityIcon, {
								activities: props.activities
							}));
							ret.props.children.push(src_React.createElement(ListeningIcon, {
								activities: props.activities
							}))
						}
					}));
					forceUpdateAll(memberListItem);
					forceUpdateAll(peopleListItem);
					forceUpdateAll(privateChannel)
				}
				onStop() {
					external_BdApi_namespaceObject.Patcher.unpatchAll("ActivityIcons");
					(0, external_BdApi_namespaceObject.clearCSS)("ActivityIcons");
					forceUpdateAll(memberListItem);
					forceUpdateAll(peopleListItem);
					forceUpdateAll(privateChannel)
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