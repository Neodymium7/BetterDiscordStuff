/**
 * @name ActivityIcons
 * @author Neodymium
 * @version 1.4.0
 * @description Improves the default icons next to statuses
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityIcons/ActivityIcons.plugin.js
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
		name: "ActivityIcons",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.4.0",
		description: "Improves the default icons next to statuses",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityIcons/ActivityIcons.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/ActivityIcons/ActivityIcons.plugin.js"
	},
	changelog: [
		{
			title: "Improved",
			type: "improved",
			items: [
				"Added icon for 'Watching' activities",
				"Added more settings options."
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
		const name = "ActivityIcons";
	
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
		function byValues(...filters) {
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
		}
	
		// modules/discordmodules.tsx
		const {
			Filters: { byStrings }
		} = betterdiscord.Webpack;
		const Error$1 = (_props) => BdApi.React.createElement("div", null, BdApi.React.createElement("h1", {
			style: { color: "red" }
		}, "Error: Component not found"));
		const ActivityStatus = expectModule({
			filter: byValues(byStrings("applicationStream")),
			name: "ActivityStatus",
			fatal: true
		});
		const Icons = {
			Activity: expectModule({
				filter: byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"),
				name: "Activity",
				fallback: (_props) => null
			}),
			RichActivity: expectModule({
				filter: byStrings("M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"),
				name: "RichActivity",
				fallback: (_props) => null
			}),
			Headset: expectModule({
				filter: byStrings("M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"),
				name: "Headset",
				fallback: (_props) => null
			}),
			Screen: expectModule({
				filter: byStrings("M4 2.5C2.897 2.5 2 3.397 2 4.5V15.5C2 16.604 2.897", "2.5H4ZM20"),
				name: "Screen",
				fallback: (_props) => null
			})
		};
		const SwitchItem = expectModule({
			filter: (m) => m.toString?.().includes("().dividerDefault"),
			searchExports: true,
			name: "SwitchItem",
			fallback: Error$1
		});
		getClasses("Margins", ["marginBottom8"]);
		const peopleListItemSelector = getSelectors("People List Classes", ["peopleListItem"]).peopleListItem;
		const memberSelector = getSelectors("Member Class", ["memberInner", "member"]).member;
		const privateChannelSelector = getSelectors("Private Channel Classes", ["favoriteIcon", "channel"]).channel;
	
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
		const Dispatcher = betterdiscord.Webpack.getModule(betterdiscord.Webpack.Filters.byProps("dispatch", "subscribe"));
		const LocaleManager = betterdiscord.Webpack.getModule((m) => m.Messages?.CLOSE);
		function createStrings(locales, defaultLocale) {
			let strings = locales[defaultLocale];
			const setLocale = () => {
				strings = locales[LocaleManager.getLocale()] || locales[defaultLocale];
			};
			const stringsManager = {
				subscribe() {
					setLocale();
					Dispatcher.subscribe("I18N_LOAD_SUCCESS", setLocale);
				},
				unsubscribe() {
					Dispatcher.unsubscribe("I18N_LOAD_SUCCESS", setLocale);
				}
			};
			for (const key in strings) {
				Object.defineProperty(stringsManager, key, {
					get() {
						return strings[key] || this.locales[this.defaultLocale][key];
					},
					enumerable: true,
					configurable: false
				});
			}
			return stringsManager;
		}
	
		// locales.json
		const locales = {
			"en-US": {
			ACTIVITY_TOOLTIP_LENGTH_2: "{{ACTIVITY1}} and {{ACTIVITY2}}",
			ACTIVITY_TOOLTIP_LENGTH_3: "{{ACTIVITY1}}, {{ACTIVITY2}}, and {{ACTIVITY3}}",
			ACTIVITY_TOOLTIP_LENGTH_MANY: "{{ACTIVITY1}}, {{ACTIVITY2}}, and {{COUNT}} more",
			LISTENING_TOOLTIP_ARTIST: "by {{NAME}}",
			SETTINGS_NORMAL_ACTIVITY: "Normal Activity Icons",
			SETTINGS_NORMAL_ACTIVITY_NOTE: "Show icons for normal activities (games and other activities).",
			SETTINGS_RICH_PRESENCE: "Rich Presence Icons",
			SETTINGS_RICH_PRESENCE_NOTE: "Show icons for rich presence activities (replaces normal activity icon).",
			SETTINGS_PLATFORM: "Platform Icons",
			SETTINGS_PLATFORM_NOTE: "Show icons for activity platforms (Xbox, Playstation, etc.) (replaces normal activity icon).",
			SETTINGS_WATCHING: "Watching Icons",
			SETTINGS_WATCHING_NOTE: "Show icons for watching activities (YouTube Watch Together, etc.).",
			SETTINGS_LISTENING: "Listening Icons",
			SETTINGS_LISTENING_NOTE: "Show icons for listening activities (Spotify)."
		},
			"sv-SE": {
			ACTIVITY_TOOLTIP_LENGTH_2: "{{ACTIVITY1}} och {{ACTIVITY2}}",
			ACTIVITY_TOOLTIP_LENGTH_3: "{{ACTIVITY1}}, {{ACTIVITY2}} och {{ACTIVITY3}}",
			ACTIVITY_TOOLTIP_LENGTH_MANY: "{{ACTIVITY1}}, {{ACTIVITY2}} och {{COUNT}} till",
			LISTENING_TOOLTIP_ARTIST: "av {{NAME}}"
		}
		};
	
		// modules/utils.ts
		const Settings = createSettings({
			normalActivityIcons: true,
			richPresenceIcons: true,
			platformIcons: true,
			listeningIcons: true,
			watchingIcons: true
		});
		const Strings = createStrings(locales, "en-US");
		function forceUpdateAll(selector, propsFilter = (_) => true) {
			const elements = document.querySelectorAll(selector);
			for (const element of elements) {
				const instance = betterdiscord.ReactUtils.getInternalInstance(element);
				const stateNode = betterdiscord.Utils.findInTree(
					instance,
					(n) => n?.stateNode?.forceUpdate && propsFilter(n.stateNode.props),
					{ walkable: ["return"] }
				).stateNode;
				stateNode.forceUpdate();
			}
		}
	
		// styles.css
		const css = ".activity-icon {\n\twidth: 16px;\n\theight: 16px;\n\tmargin-left: 4px;\n\t-webkit-box-flex: 0;\n\tflex: 0 0 auto;\n}\n\n.activity-icon-small {\n\tmargin: 1px;\n}\n\n.rich-activity-icon {\n\tmargin-left: 2px;\n\tmargin-right: -2px;\n}\n\n.activity-icon > div {\n\twidth: inherit;\n\theight: inherit;\n}\n";
	
		// assets/playstation.svg
		const SvgPlaystation = (props) => BdApi.React.createElement("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 24 24",
			...props
		}, BdApi.React.createElement("path", {
			d: "M23.669 17.155c-.464.586-1.602 1.004-1.602 1.004l-8.459 3.038v-2.24l6.226-2.219c.706-.253.815-.61.24-.798-.573-.189-1.61-.135-2.318.12l-4.148 1.46v-2.325l.24-.081s1.198-.424 2.884-.611c1.685-.186 3.749.025 5.369.64 1.826.576 2.031 1.427 1.568 2.012Zm-9.255-3.815V7.61c0-.673-.124-1.293-.756-1.468-.483-.155-.783.294-.783.966v14.35l-3.87-1.228V3.12c1.645.305 4.042 1.028 5.331 1.462 3.277 1.125 4.389 2.526 4.389 5.681 0 3.076-1.899 4.242-4.311 3.077Zm-12.51 5.382C.028 18.194-.284 17.094.571 16.461c.79-.585 2.132-1.025 2.132-1.025l5.549-1.974v2.25L4.26 17.14c-.706.253-.814.611-.241.8.574.187 1.612.134 2.318-.12l1.916-.695v2.012c-.122.022-.257.043-.382.064a12.556 12.556 0 0 1-5.968-.48Z",
			fill: "currentColor"
		}));
	
		// assets/xbox.svg
		const SvgXbox = (props) => BdApi.React.createElement("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 24 24",
			...props
		}, BdApi.React.createElement("path", {
			d: "M11.004 21.959c-1.54-.147-3.099-.7-4.44-1.575-1.124-.733-1.378-1.033-1.378-1.635 0-1.206 1.329-3.32 3.598-5.727 1.29-1.368 3.086-2.972 3.28-2.93.378.085 3.397 3.03 4.527 4.413 1.789 2.194 2.612 3.989 2.194 4.789-.318.608-2.287 1.796-3.733 2.251-1.193.378-2.76.538-4.048.413Zm-7.333-4.462c-.932-1.43-1.404-2.84-1.633-4.877-.075-.673-.049-1.057.172-2.439.273-1.72 1.252-3.71 2.431-4.937.503-.522.548-.535 1.16-.328.743.25 1.535.797 2.765 1.91l.719.648-.392.482c-1.822 2.234-3.742 5.401-4.465 7.36-.394 1.064-.552 2.134-.383 2.578.113.3.009.19-.374-.397Zm16.375.242c.091-.449-.024-1.275-.298-2.108-.59-1.803-2.567-5.161-4.383-7.442l-.572-.717.619-.569c.807-.741 1.368-1.186 1.973-1.56.479-.298 1.16-.56 1.453-.56.18 0 .817.659 1.33 1.38.797 1.116 1.382 2.47 1.678 3.878.192.911.207 2.859.031 3.765-.144.744-.451 1.71-.75 2.367-.224.491-.78 1.444-1.025 1.755-.125.155-.125.155-.056-.19ZM11.17 4.44c-.839-.426-2.131-.881-2.846-1.006a5.333 5.333 0 0 0-.95-.053c-.59.029-.562 0 .383-.446a9.717 9.717 0 0 1 2.332-.775c1.001-.211 2.881-.214 3.867-.005 1.063.225 2.316.69 3.021 1.124l.21.129-.482-.025c-.956-.049-2.349.338-3.846 1.066-.452.22-.844.396-.872.389a15.527 15.527 0 0 1-.817-.398Z",
			fill: "currentColor"
		}));
	
		// @lib/utils/string.ts
		function parseString(string, parseObject) {
			const delimiters = ["{{", "}}"];
			for (const key in parseObject) {
				string = string.replace(new RegExp(delimiters[0] + key + delimiters[1], "g"), parseObject[key]);
			}
			return string;
		}
		function parseStringReact(string, parseObject) {
			const delimiters = ["{{", "}}"];
			const splitRegex = new RegExp(`(${delimiters[0]}.+?${delimiters[1]})`, "g");
			const itemRegex = new RegExp(delimiters[0] + "(.+)" + delimiters[1]);
			const parts = string.split(splitRegex).filter(Boolean);
			return parts.map((part) => {
				if (!itemRegex.test(part))
					return part;
				const key = part.replace(itemRegex, "$1");
				return parseObject[key] ?? part;
			});
		}
	
		// components/ActivityIcon.tsx
		const botActivityKeys = ["created_at", "id", "name", "type", "url"];
		function ActivityIcon(props) {
			const { normalActivityIcons, richPresenceIcons, platformIcons } = Settings.useSettingsState();
			if (!normalActivityIcons && !richPresenceIcons && !platformIcons)
				return null;
			const isBot = props.activities.length === 1 && props.activities[0].type === 0 && Object.keys(props.activities[0]).every((value, i) => value === botActivityKeys[i]);
			if (isBot || props.activities.length === 0)
				return null;
			const normalActivities = props.activities.filter((activity) => activity.type === 0);
			const hasCustomStatus = props.activities.some((activity) => activity.type === 4 && activity.state);
			const hasRP = normalActivities.some((activity) => (activity.assets || activity.details) && !activity.platform);
			const onPS = normalActivities.some((activity) => activity.platform === "ps5" || activity.platform === "ps4");
			const onXbox = normalActivities.some((activity) => activity.platform === "xbox");
			if (normalActivities.length === 0)
				return null;
			if (!normalActivityIcons && !hasRP && !onPS && !onXbox)
				return null;
			if (!normalActivityIcons && !platformIcons && richPresenceIcons && !hasRP)
				return null;
			if (!normalActivityIcons && !richPresenceIcons && platformIcons && !onPS && !onXbox)
				return null;
			let tooltip;
			if (normalActivities.length === 1 && hasCustomStatus) {
				tooltip = BdApi.React.createElement("strong", null, normalActivities[0].name);
			} else if (normalActivities.length === 2) {
				tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_2, {
					ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
					ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name)
				});
			} else if (normalActivities.length === 3) {
				tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_3, {
					ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
					ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name),
					ACTIVITY3: BdApi.React.createElement("strong", null, normalActivities[2].name)
				});
			} else if (normalActivities.length > 3) {
				tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_MANY, {
					ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
					ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name),
					COUNT: normalActivities.length - 2
				});
			}
			let icon = BdApi.React.createElement(Icons.Activity, {
				width: "16",
				height: "16"
			});
			if (platformIcons && onPS)
				icon = BdApi.React.createElement(SvgPlaystation, {
					width: "14",
					height: "14",
					className: "activity-icon-small"
				});
			if (platformIcons && onXbox)
				icon = BdApi.React.createElement(SvgXbox, {
					width: "14",
					height: "14",
					className: "activity-icon-small"
				});
			if (richPresenceIcons && hasRP)
				icon = BdApi.React.createElement(Icons.RichActivity, {
					width: "16",
					height: "16"
				});
			return tooltip ? BdApi.React.createElement(betterdiscord.Components.Tooltip, {
				text: tooltip,
				position: "top"
			}, (props2) => BdApi.React.createElement("div", {
				...props2,
				className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon"
			}, icon)) : BdApi.React.createElement("div", {
				className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon"
			}, icon);
		}
	
		// components/ListeningIcon.tsx
		function ListeningIcon(props) {
			const { listeningIcons } = Settings.useSettingsState();
			if (!listeningIcons)
				return null;
			const activity = props.activities.filter((activity2) => activity2.type === 2)[0];
			if (!activity)
				return null;
			return BdApi.React.createElement(betterdiscord.Components.Tooltip, {
				text: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", {
					style: { fontWeight: "600" }
				}, activity.details), activity.state && BdApi.React.createElement("div", {
					style: { fontWeight: "400" }
				}, parseString(Strings.LISTENING_TOOLTIP_ARTIST, {
					NAME: activity.state.replace(/;/g, ",")
				}))),
				position: "top"
			}, (props2) => BdApi.React.createElement("div", {
				...props2,
				className: "activity-icon"
			}, BdApi.React.createElement(Icons.Headset, {
				className: "activity-icon-small",
				width: "14",
				height: "14"
			})));
		}
	
		// components/SettingsPanel.tsx
		function SettingsPanel() {
			const settingsState = Settings.useSettingsState();
			return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(SwitchItem, {
				children: Strings.SETTINGS_NORMAL_ACTIVITY,
				note: Strings.SETTINGS_NORMAL_ACTIVITY_NOTE,
				value: settingsState.normalActivityIcons,
				onChange: (v) => {
					Settings.normalActivityIcons = v;
				}
			}), BdApi.React.createElement(SwitchItem, {
				children: Strings.SETTINGS_RICH_PRESENCE,
				note: Strings.SETTINGS_RICH_PRESENCE_NOTE,
				value: settingsState.richPresenceIcons,
				onChange: (v) => {
					Settings.richPresenceIcons = v;
				}
			}), BdApi.React.createElement(SwitchItem, {
				children: Strings.SETTINGS_PLATFORM,
				note: Strings.SETTINGS_PLATFORM_NOTE,
				value: settingsState.platformIcons,
				onChange: (v) => {
					Settings.platformIcons = v;
				}
			}), BdApi.React.createElement(SwitchItem, {
				children: Strings.SETTINGS_LISTENING,
				note: Strings.SETTINGS_LISTENING_NOTE,
				value: settingsState.listeningIcons,
				onChange: (v) => {
					Settings.listeningIcons = v;
				}
			}), BdApi.React.createElement(SwitchItem, {
				children: Strings.SETTINGS_WATCHING,
				note: Strings.SETTINGS_WATCHING_NOTE,
				value: settingsState.watchingIcons,
				onChange: (v) => {
					Settings.watchingIcons = v;
				}
			}));
		}
	
		// components/WatchingIcon.tsx
		function WatchingIcon(props) {
			const { watchingIcons } = Settings.useSettingsState();
			if (!watchingIcons)
				return null;
			const activity = props.activities.filter((activity2) => activity2.type === 3)[0];
			if (!activity)
				return null;
			return BdApi.React.createElement(betterdiscord.Components.Tooltip, {
				text: BdApi.React.createElement("strong", null, activity.name)
			}, (props2) => BdApi.React.createElement("div", {
				...props2,
				className: "activity-icon"
			}, BdApi.React.createElement(Icons.Screen, {
				className: "activity-icon-small",
				width: "14",
				height: "14"
			})));
		}
	
		// index.tsx
		class ActivityIcons extends BasePlugin {
			onStart() {
				betterdiscord.DOM.addStyle(css);
				Strings.subscribe();
				this.patchActivityStatus();
			}
			patchActivityStatus() {
				betterdiscord.Patcher.after(ActivityStatus, "Z", (_, [props], ret) => {
					if (!ret)
						return;
					ret.props.children[2] = null;
					ret.props.children.push(
						BdApi.React.createElement(ActivityIcon, {
							activities: props.activities
						}),
						BdApi.React.createElement(WatchingIcon, {
							activities: props.activities
						}),
						BdApi.React.createElement(ListeningIcon, {
							activities: props.activities
						})
					);
				});
				forceUpdateAll(memberSelector, (i) => i.user);
				forceUpdateAll(peopleListItemSelector, (i) => i.user);
				forceUpdateAll(privateChannelSelector);
			}
			onStop() {
				betterdiscord.Patcher.unpatchAll();
				betterdiscord.DOM.removeStyle();
				Strings.unsubscribe();
				forceUpdateAll(memberSelector, (i) => i.user);
				forceUpdateAll(peopleListItemSelector, (i) => i.user);
				forceUpdateAll(privateChannelSelector);
			}
			getSettingsPanel() {
				return BdApi.React.createElement(SettingsPanel, null);
			}
		}
	
		return ActivityIcons;
	
	})(new BdApi("ActivityIcons"), BasePlugin, BdApi.React);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/