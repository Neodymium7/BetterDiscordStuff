/**
 * @name ActivityIcons
 * @author Neodymium
 * @version 1.5.0
 * @description Improves the default icons next to statuses
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ActivityIcons/ActivityIcons.plugin.js
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

const betterdiscord = new BdApi("ActivityIcons");
const react = BdApi.React;

// @lib/settings.ts
class SettingsManager {
	settings = betterdiscord.Data.load("settings");
	listeners = new Set();
	/**
	 * Creates a new `SettingsManager` object with the given default settings.
	 * @param defaultSettings An object containing the default settings.
	 * @returns A `SettingsManager` object.
	 */
	constructor(defaultSettings) {
		if (!this.settings) {
			betterdiscord.Data.save("settings", defaultSettings);
			this.settings = defaultSettings;
			return;
		}
		if (Object.keys(this.settings) !== Object.keys(defaultSettings)) {
			this.settings = { ...defaultSettings, ...this.settings };
			let changed = false;
			for (const key in this.settings) {
				if (!(key in defaultSettings)) {
					delete this.settings[key];
					changed = true;
				}
			}
			if (changed) betterdiscord.Data.save("settings", this.settings);
		}
	}
	/**
	 * Adds a listener that runs when a setting is changed.
	 * @param listener A callback to run when a setting is changed. Takes two optional parameters: the key of the setting, and its new value.
	 * @returns A function to remove the listener.
	 */
	addListener(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	/**
	 * Removes all listeners. Used for cleanup from {@link addListener}. Should be run at plugin stop if any listeners were added and not removed.
	 */
	clearListeners() {
		this.listeners.clear();
	}
	/**
	 * A React hook that gets a the settings object as a stateful variable.
	 * @param keys Settings keys to include in the state object.
	 * @returns The settings object as a stateful value.
	 */
	useSettingsState(...keys) {
		let initialState = this.settings;
		if (keys.length) initialState = Object.fromEntries(keys.map((key) => [key, initialState[key]]));
		const [state, setState] = react.useState(initialState);
		react.useEffect(() => {
			return this.addListener((key, value) => {
				if (!keys.length || keys.includes(key)) setState((state2) => ({ ...state2, [key]: value }));
			});
		}, []);
		return state;
	}
	/**
	 * Gets the value of a setting.
	 * @param key The setting key.
	 * @returns The setting's current value.
	 */
	get(key) {
		return this.settings[key];
	}
	/**
	 * Sets the value of a setting.
	 * @param key The setting key.
	 * @param value The new setting value.
	 */
	set(key, value) {
		this.settings[key] = value;
		betterdiscord.Data.save("settings", this.settings);
		for (const listener of this.listeners) listener(key, value);
	}
}

// @lib/strings.ts
const LocaleStore = betterdiscord.Webpack.getStore("LocaleStore");
class StringsManager {
	locales;
	defaultLocale;
	strings;
	/**
	 * Creates a `StringsManager` object with the given locales object.
	 * @param locales An object containing the strings for each locale.
	 * @param defaultLocale The code of the locale to use as a fallback when strings for Discord's selected locale are not defined.
	 * @returns A `StringsManager` object.
	 */
	constructor(locales, defaultLocale) {
		this.locales = locales;
		this.defaultLocale = defaultLocale;
		this.strings = locales[defaultLocale];
	}
	setLocale = () => {
		this.strings = this.locales[LocaleStore.locale] || this.locales[this.defaultLocale];
	};
	/**
	 * Subscribes to Discord's locale changes. Should be run on plugin start.
	 */
	subscribe() {
		this.setLocale();
		LocaleStore.addReactChangeListener(this.setLocale);
	}
	/**
	 * Unsubscribes from Discord's locale changes. Should be run on plugin stop.
	 */
	unsubscribe() {
		LocaleStore.removeReactChangeListener(this.setLocale);
	}
	/**
	 * Gets the string for the corresponding key in Discord's currently selected locale.
	 * @param key The string key.
	 * @returns A localized string.
	 */
	get(key) {
		return this.strings[key] || this.locales[this.defaultLocale][key];
	}
}

// @lib/changelog.ts
function showChangelog(changes, meta) {
	if (!changes || changes.length == 0) return;
	const changelogVersion = betterdiscord.Data.load("changelogVersion");
	if (meta.version === changelogVersion) return;
	betterdiscord.UI.showChangelogModal({
		title: meta.name,
		subtitle: meta.version,
		changes
	});
	betterdiscord.Data.save("changelogVersion", meta.version);
}

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
	const errorMessage = `Module ${options.name} not found.${fallbackMessage}

Contact the plugin developer to inform them of this error.`;
	betterdiscord.Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);
	return options.fallback;
}
function expectModule(options) {
	return expect(betterdiscord.Webpack.getModule(options.filter, options), options);
}
function expectClasses(name, classes) {
	return expect(getClasses(...classes), {
		name,
		fallback: classes.reduce((obj, key) => {
			obj[key] = "unknown-class";
			return obj;
		}, {})
	});
}
function expectSelectors(name, classes) {
	return expect(getSelectors(...classes), {
		name,
		fallback: classes.reduce((obj, key) => {
			obj[key] = null;
			return obj;
		}, {})
	});
}
function expectIcon(name, searchString) {
	return expect(getIcon(searchString), {
		name,
		fallback: (_props) => null
	});
}

// modules/discordmodules.tsx
const {
	Filters: { byKeys, byStrings }
} = betterdiscord.Webpack;
const Error$1 = (_props) => BdApi.React.createElement("div", null, BdApi.React.createElement("h1", { style: { color: "red" } }, "Error: Component not found"));
const ActivityStatus = expectModule({
	filter: byStrings("QuestsIcon", "hangStatusActivity"),
	name: "ActivityStatus",
	defaultExport: false,
	fatal: true
});
const Icons = {
	Activity: expectIcon(
		"Activity",
		"M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09"
	),
	RichActivity: expectIcon("RichActivity", "M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"),
	Headset: expectIcon("Headset", "M12 3a9 9 0 0 0-8.95 10h1.87a5 5 0 0 1 4.1 2.13l1.37 1.97a3.1 3.1 0 0"),
	Screen: expectIcon("Screen", "M5 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5ZM13.5 20a.5.5")
};
const Common = expectModule({
	filter: byKeys("FormSwitch"),
	name: "Common",
	fallback: {
		FormSwitch: Error$1
	}
});
expectClasses("Margins", ["marginBottom8"]);
const peopleListItemSelector = expectSelectors("People List Classes", ["peopleListItem"]).peopleListItem;
const memberSelector = expectSelectors("Member Class", ["memberInner", "member"]).member;
const privateChannelSelector = expectSelectors("Private Channel Classes", ["favoriteIcon", "channel"]).channel;

// manifest.json
const changelog = [
	{
		title: "Improved",
		type: "improved",
		items: [
			"ActivityIcons no longer depends on ZeresPluginLibrary for functionality!"
		]
	}
];

// locales.json
const fr = {
	ACTIVITY_TOOLTIP_LENGTH_2: "{{ACTIVITY1}} et {{ACTIVITY2}}",
	ACTIVITY_TOOLTIP_LENGTH_3: "{{ACTIVITY1}}, {{ACTIVITY2}}, et {{ACTIVITY3}}",
	ACTIVITY_TOOLTIP_LENGTH_MANY: "{{ACTIVITY1}}, {{ACTIVITY2}}, et {{COUNT}} de plus",
	LISTENING_TOOLTIP_ARTIST: "de {{NAME}}",
	SETTINGS_NORMAL_ACTIVITY: "Icônes d'activité normale",
	SETTINGS_NORMAL_ACTIVITY_NOTE: "Affiche des icônes pour les activités normales (jeux et autres activités).",
	SETTINGS_RICH_PRESENCE: "Icônes Rich Presence",
	SETTINGS_RICH_PRESENCE_NOTE: "Affiche des icônes pour les activités Rich Presence (remplace l'icône d'activité normale).",
	SETTINGS_PLATFORM: "Icônes de Plateforme",
	SETTINGS_PLATFORM_NOTE: "Affiche des icônes pour les activités sur plateformes (Xbox, Playstation, etc.) (remplace l'icône d'activité normale).",
	SETTINGS_WATCHING: "Icônes de visionnage",
	SETTINGS_WATCHING_NOTE: "Affiche des icônes pour les activités de visionnage (YouTube Watch Together, etc.).",
	SETTINGS_LISTENING: "Icônes d'écoute",
	SETTINGS_LISTENING_NOTE: "Affiche des icônes pour les activités d'écoute (Spotify)."
};
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
},
	fr: fr
};

// modules/utils.ts
const Settings = new SettingsManager({
	normalActivityIcons: true,
	richPresenceIcons: true,
	platformIcons: true,
	listeningIcons: true,
	watchingIcons: true
});
const Strings = new StringsManager(locales, "en-US");
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
const botActivityKeys = ["created_at", "id", "name", "type", "url"];
function isBot(activities) {
	return activities.length === 1 && Object.keys(activities[0]).every((value, i) => value === botActivityKeys[i]);
}

// styles.css
const css = `
.activity-icon {
	width: 16px;
	height: 16px;
	margin-left: 4px;
	-webkit-box-flex: 0;
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
}

.rich-activity-icon {
	margin-left: 2px;
	margin-right: -2px;
}

.activity-icon > div {
	width: inherit;
	height: inherit;
}
`;

// assets/playstation.svg
const SvgPlaystation = (props) => BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ...props }, BdApi.React.createElement("path", { d: "M23.669 17.155c-.464.586-1.602 1.004-1.602 1.004l-8.459 3.038v-2.24l6.226-2.219c.706-.253.815-.61.24-.798-.573-.189-1.61-.135-2.318.12l-4.148 1.46v-2.325l.24-.081s1.198-.424 2.884-.611c1.685-.186 3.749.025 5.369.64 1.826.576 2.031 1.427 1.568 2.012Zm-9.255-3.815V7.61c0-.673-.124-1.293-.756-1.468-.483-.155-.783.294-.783.966v14.35l-3.87-1.228V3.12c1.645.305 4.042 1.028 5.331 1.462 3.277 1.125 4.389 2.526 4.389 5.681 0 3.076-1.899 4.242-4.311 3.077Zm-12.51 5.382C.028 18.194-.284 17.094.571 16.461c.79-.585 2.132-1.025 2.132-1.025l5.549-1.974v2.25L4.26 17.14c-.706.253-.814.611-.241.8.574.187 1.612.134 2.318-.12l1.916-.695v2.012c-.122.022-.257.043-.382.064a12.556 12.556 0 0 1-5.968-.48Z", fill: "currentColor" }));

// assets/xbox.svg
const SvgXbox = (props) => BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ...props }, BdApi.React.createElement("path", { d: "M11.004 21.959c-1.54-.147-3.099-.7-4.44-1.575-1.124-.733-1.378-1.033-1.378-1.635 0-1.206 1.329-3.32 3.598-5.727 1.29-1.368 3.086-2.972 3.28-2.93.378.085 3.397 3.03 4.527 4.413 1.789 2.194 2.612 3.989 2.194 4.789-.318.608-2.287 1.796-3.733 2.251-1.193.378-2.76.538-4.048.413Zm-7.333-4.462c-.932-1.43-1.404-2.84-1.633-4.877-.075-.673-.049-1.057.172-2.439.273-1.72 1.252-3.71 2.431-4.937.503-.522.548-.535 1.16-.328.743.25 1.535.797 2.765 1.91l.719.648-.392.482c-1.822 2.234-3.742 5.401-4.465 7.36-.394 1.064-.552 2.134-.383 2.578.113.3.009.19-.374-.397Zm16.375.242c.091-.449-.024-1.275-.298-2.108-.59-1.803-2.567-5.161-4.383-7.442l-.572-.717.619-.569c.807-.741 1.368-1.186 1.973-1.56.479-.298 1.16-.56 1.453-.56.18 0 .817.659 1.33 1.38.797 1.116 1.382 2.47 1.678 3.878.192.911.207 2.859.031 3.765-.144.744-.451 1.71-.75 2.367-.224.491-.78 1.444-1.025 1.755-.125.155-.125.155-.056-.19ZM11.17 4.44c-.839-.426-2.131-.881-2.846-1.006a5.333 5.333 0 0 0-.95-.053c-.59.029-.562 0 .383-.446a9.717 9.717 0 0 1 2.332-.775c1.001-.211 2.881-.214 3.867-.005 1.063.225 2.316.69 3.021 1.124l.21.129-.482-.025c-.956-.049-2.349.338-3.846 1.066-.452.22-.844.396-.872.389a15.527 15.527 0 0 1-.817-.398Z", fill: "currentColor" }));

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
		if (!itemRegex.test(part)) return part;
		const key = part.replace(itemRegex, "$1");
		return parseObject[key] ?? part;
	});
}

// components/ActivityIcon.tsx
function ActivityIcon(props) {
	const { normalActivityIcons, richPresenceIcons, platformIcons } = Settings.useSettingsState(
		"normalActivityIcons",
		"richPresenceIcons",
		"platformIcons"
	);
	if (!normalActivityIcons && !richPresenceIcons && !platformIcons) return null;
	if (isBot(props.activities) || props.activities.length === 0) return null;
	const normalActivities = props.activities.filter((activity) => activity.type === 0);
	const hasCustomStatus = props.activities.some((activity) => activity.type === 4 && activity.state);
	const hasRP = normalActivities.some((activity) => (activity.assets || activity.details) && !activity.platform);
	const onPS = normalActivities.some((activity) => activity.platform === "ps5" || activity.platform === "ps4");
	const onXbox = normalActivities.some((activity) => activity.platform === "xbox");
	if (normalActivities.length === 0) return null;
	if (!normalActivityIcons && !hasRP && !onPS && !onXbox) return null;
	if (!normalActivityIcons && !platformIcons && richPresenceIcons && !hasRP) return null;
	if (!normalActivityIcons && !richPresenceIcons && platformIcons && !onPS && !onXbox) return null;
	let tooltip;
	if (normalActivities.length === 1 && hasCustomStatus) {
		tooltip = BdApi.React.createElement("strong", null, normalActivities[0].name);
	} else if (normalActivities.length === 2) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_2"), {
			ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
			ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name)
		});
	} else if (normalActivities.length === 3) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_3"), {
			ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
			ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name),
			ACTIVITY3: BdApi.React.createElement("strong", null, normalActivities[2].name)
		});
	} else if (normalActivities.length > 3) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_MANY"), {
			ACTIVITY1: BdApi.React.createElement("strong", null, normalActivities[0].name),
			ACTIVITY2: BdApi.React.createElement("strong", null, normalActivities[1].name),
			COUNT: normalActivities.length - 2
		});
	}
	let icon = BdApi.React.createElement(Icons.Activity, { color: "currentColor", size: "13", width: "13", height: "13" });
	if (platformIcons && onPS) icon = BdApi.React.createElement(SvgPlaystation, { color: "currentColor", size: "13", width: "13", height: "13" });
	if (platformIcons && onXbox) icon = BdApi.React.createElement(SvgXbox, { color: "currentColor", size: "13", width: "13", height: "13" });
	if (richPresenceIcons && hasRP) icon = BdApi.React.createElement(Icons.RichActivity, { color: "currentColor", size: "16", width: "16", height: "16" });
	return tooltip ? BdApi.React.createElement(betterdiscord.Components.Tooltip, { text: tooltip, position: "top" }, (props2) => BdApi.React.createElement("div", { ...props2, className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon" }, icon)) : BdApi.React.createElement("div", { className: hasRP ? "activity-icon rich-activity-icon" : "activity-icon" }, icon);
}

// components/ListeningIcon.tsx
function ListeningIcon(props) {
	const { listeningIcons } = Settings.useSettingsState("listeningIcons");
	if (!listeningIcons) return null;
	if (isBot(props.activities)) return null;
	const activity = props.activities.filter((activity2) => activity2.type === 2)[0];
	if (!activity) return null;
	return BdApi.React.createElement(
		betterdiscord.Components.Tooltip,
		{
			text: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { style: { fontWeight: "600" } }, activity.details), activity.state && BdApi.React.createElement("div", { style: { fontWeight: "400" } }, parseString(Strings.get("LISTENING_TOOLTIP_ARTIST"), {
				NAME: activity.state.replace(/;/g, ",")
			}))),
			position: "top"
		},
		(props2) => BdApi.React.createElement("div", { ...props2, className: "activity-icon" }, BdApi.React.createElement(Icons.Headset, { color: "currentColor", size: "13", width: "13", height: "13" }))
	);
}

// components/SettingsPanel.tsx
function SettingsPanel() {
	const settingsState = Settings.useSettingsState();
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_NORMAL_ACTIVITY"),
			note: Strings.get("SETTINGS_NORMAL_ACTIVITY_NOTE"),
			value: settingsState.normalActivityIcons,
			onChange: (v) => {
				Settings.set("normalActivityIcons", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_RICH_PRESENCE"),
			note: Strings.get("SETTINGS_RICH_PRESENCE_NOTE"),
			value: settingsState.richPresenceIcons,
			onChange: (v) => {
				Settings.set("richPresenceIcons", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_PLATFORM"),
			note: Strings.get("SETTINGS_PLATFORM_NOTE"),
			value: settingsState.platformIcons,
			onChange: (v) => {
				Settings.set("platformIcons", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_LISTENING"),
			note: Strings.get("SETTINGS_LISTENING_NOTE"),
			value: settingsState.listeningIcons,
			onChange: (v) => {
				Settings.set("listeningIcons", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_WATCHING"),
			note: Strings.get("SETTINGS_WATCHING_NOTE"),
			value: settingsState.watchingIcons,
			onChange: (v) => {
				Settings.set("watchingIcons", v);
			}
		}
	));
}

// components/WatchingIcon.tsx
function WatchingIcon(props) {
	const { watchingIcons } = Settings.useSettingsState("watchingIcons");
	if (!watchingIcons) return null;
	if (isBot(props.activities)) return null;
	const activity = props.activities.filter((activity2) => activity2.type === 3)[0];
	if (!activity) return null;
	return BdApi.React.createElement(betterdiscord.Components.Tooltip, { text: BdApi.React.createElement("strong", null, activity.name) }, (props2) => BdApi.React.createElement("div", { ...props2, className: "activity-icon" }, BdApi.React.createElement(Icons.Screen, { color: "currentColor", size: "13", width: "13", height: "13" })));
}

// index.tsx
class ActivityIcons {
	meta;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(css);
		Strings.subscribe();
		this.patchActivityStatus();
	}
	patchActivityStatus() {
		betterdiscord.Patcher.after(ActivityStatus, "ZP", (_, [props], ret) => {
			if (!ret) return;
			const defaultIconIndex = ret.props.children.findIndex(
				(element) => element?.props?.className?.startsWith("icon")
			);
			if (defaultIconIndex !== -1) {
				ret.props.children[defaultIconIndex] = null;
			}
			ret.props.children.push(
				BdApi.React.createElement(ActivityIcon, { activities: props.activities }),
				BdApi.React.createElement(WatchingIcon, { activities: props.activities }),
				BdApi.React.createElement(ListeningIcon, { activities: props.activities })
			);
		});
		forceUpdateAll(memberSelector, (i) => i.user);
		forceUpdateAll(peopleListItemSelector, (i) => i.user);
		forceUpdateAll(privateChannelSelector);
	}
	stop() {
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

module.exports = ActivityIcons;

/*@end@*/