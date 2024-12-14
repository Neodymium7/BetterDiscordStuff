/**
 * @name RoleMentionIcons
 * @author Neodymium
 * @version 1.4.0
 * @description Displays icons next to role mentions.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js
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

const betterdiscord = new BdApi("RoleMentionIcons");
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

// manifest.json
const changelog = [
	{
		title: "Improved",
		type: "improved",
		items: [
			"RoleMentionIcons no longer depends on ZeresPluginLibrary for functionality!"
		]
	},
	{
		title: "Fixed",
		type: "fixed",
		items: [
			"Fixed a memory leak (oops)."
		]
	}
];

// @lib/utils/webpack.ts
function getClasses(...classes) {
	return betterdiscord.Webpack.getModule((m) => betterdiscord.Webpack.Filters.byKeys(...classes)(m) && typeof m[classes[0]] == "string");
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

// modules/discordmodules.tsx
const {
	Filters: { byKeys },
	getStore
} = betterdiscord.Webpack;
const Error$1 = (_props) => BdApi.React.createElement("div", null, BdApi.React.createElement("h1", { style: { color: "red" } }, "Error: Component not found"));
const Common = expectModule({
	filter: byKeys("FormSwitch"),
	name: "Common",
	fallback: {
		FormSwitch: Error$1
	}
});
const roleMention = expectClasses("Role Mention Class", ["roleMention"]).roleMention.split(" ")[0];
const GuildStore = getStore("GuildStore");

// locales.json
const el = {
	SETTINGS_EVERYONE: "@everyone",
	SETTINGS_EVERYONE_NOTE: "Εμφάνιση εικονιδίων στις αναφορές «@everyone».",
	SETTINGS_HERE: "@here",
	SETTINGS_HERE_NOTE: "Εμφάνιση εικονιδίων στις αναφορές «@here».",
	SETTINGS_ROLE_ICONS: "Εικονίδια Ρόλων",
	SETTINGS_ROLE_ICONS_NOTE: "Εμφάνιση Εικονιδίων Ρόλων αντί για το προεπιλεγμένο εικονίδιο όταν είναι διαθέσιμο."
};
const fr = {
	SETTINGS_EVERYONE: "@everyone",
	SETTINGS_EVERYONE_NOTE: "Affiche des icônes sur les mentions \"@everyone\".",
	SETTINGS_HERE: "@here",
	SETTINGS_HERE_NOTE: "Affiche des icônes sur les mentions \"@here\".",
	SETTINGS_ROLE_ICONS: "Icônes de Rôle",
	SETTINGS_ROLE_ICONS_NOTE: "Affiche des icônes de rôle au lieu des icônes par défaut quand applicable"
};
const locales = {
	"en-US": {
	SETTINGS_EVERYONE: "@everyone",
	SETTINGS_EVERYONE_NOTE: "Shows icons on \"@everyone\" mentions.",
	SETTINGS_HERE: "@here",
	SETTINGS_HERE_NOTE: "Shows icons on \"@here\" mentions.",
	SETTINGS_ROLE_ICONS: "Role Icons",
	SETTINGS_ROLE_ICONS_NOTE: "Shows Role Icons instead of default icon when applicable."
},
	el: el,
	fr: fr
};

// modules/utils.ts
const Settings = new SettingsManager({
	everyone: true,
	here: true,
	showRoleIcons: true
});
const Strings = new StringsManager(locales, "en-US");
const peopleSVG = (() => {
	const element = document.createElement("div");
	element.innerHTML = '<svg class="role-mention-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14" width="14"><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M20.0001 20.006H22.0001V19.006C22.0001 16.4433 20.2697 14.4415 17.5213 13.5352C19.0621 14.9127 20.0001 16.8059 20.0001 19.006V20.006Z" fill="currentColor" /><path d="M14.8834 11.9077C16.6657 11.5044 18.0001 9.9077 18.0001 8.00598C18.0001 5.96916 16.4693 4.28218 14.4971 4.0367C15.4322 5.09511 16.0001 6.48524 16.0001 8.00598C16.0001 9.44888 15.4889 10.7742 14.6378 11.8102C14.7203 11.8418 14.8022 11.8743 14.8834 11.9077Z" fill="currentColor" /></svg>';
	return element.firstChild;
})();
const getIconElement = (roleId, roleIcon) => {
	const icon = document.createElement("img");
	icon.className = "role-mention-icon";
	icon.setAttribute("style", "border-radius: 3px; object-fit: contain;");
	icon.width = icon.height = 16;
	icon.src = `https://cdn.discordapp.com/role-icons/${roleId}/${roleIcon}.webp?size=24&quality=lossless`;
	return icon;
};
const from = (arr) => arr && arr.length > 0 && Object.assign(...arr.map(([k, v]) => ({ [k]: v })));
const filter = (obj, predicate) => from(
	Object.entries(obj).filter((o) => {
		return predicate(o[1]);
	})
);
const getProps = (el, filter2) => {
	const reactInstance = betterdiscord.ReactUtils.getInternalInstance(el);
	let current = reactInstance?.return;
	while (current) {
		if (current.pendingProps && filter2(current.pendingProps)) return current.pendingProps;
		current = current.return;
	}
	return null;
};

// components/SettingsPanel.tsx
function SettingsPanel() {
	const settingsState = Settings.useSettingsState();
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_EVERYONE"),
			note: Strings.get("SETTINGS_EVERYONE_NOTE"),
			value: settingsState.everyone,
			onChange: (v) => {
				Settings.set("everyone", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_HERE"),
			note: Strings.get("SETTINGS_HERE_NOTE"),
			value: settingsState.here,
			onChange: (v) => {
				Settings.set("here", v);
			}
		}
	), BdApi.React.createElement(
		Common.FormSwitch,
		{
			children: Strings.get("SETTINGS_ROLE_ICONS"),
			note: Strings.get("SETTINGS_ROLE_ICONS_NOTE"),
			value: settingsState.showRoleIcons,
			onChange: (v) => {
				Settings.set("showRoleIcons", v);
			}
		}
	));
}

// index.tsx
class RoleMentionIcons {
	clearCallbacks;
	meta;
	constructor(meta) {
		this.meta = meta;
		this.clearCallbacks = new Set();
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(
			`.role-mention-icon { position: relative; height: 1em; width: 1em; margin-left: 4px; } .${roleMention} { display: inline-flex; align-items: center; }`
		);
		Strings.subscribe();
		const elements = Array.from(document.getElementsByClassName(roleMention));
		this.processElements(elements);
	}
	observer({ addedNodes, removedNodes }) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			const elements = Array.from(node.getElementsByClassName(roleMention));
			this.processElements(elements);
		}
		for (const node of removedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			if (node.querySelector(".role-mention-icon")) this.clearCallbacks.clear();
		}
	}
	processElements(elements) {
		if (!elements.length) return;
		for (const element of elements) {
			const props = getProps(element, (e) => e.roleName || e.roleId);
			if (!props) return;
			const isEveryone = props.roleName === "@everyone";
			const isHere = props.roleName === "@here";
			let role;
			if (props.guildId) {
				role = filter(GuildStore.getRoles(props.guildId), (r) => r.id === props.roleId);
				role = role[Object.keys(role)[0]];
			}
			if ((Settings.get("everyone") || !isEveryone) && (Settings.get("here") || !isHere)) {
				if (role?.icon && Settings.get("showRoleIcons")) {
					const icon = getIconElement(role.id, role.icon);
					element.appendChild(icon);
					this.clearCallbacks.add(() => icon.remove());
				} else {
					const icon = peopleSVG.cloneNode(true);
					element.appendChild(icon);
					this.clearCallbacks.add(() => icon.remove());
				}
			}
		}
	}
	clearIcons() {
		this.clearCallbacks.forEach((callback) => callback());
		this.clearCallbacks.clear();
	}
	stop() {
		betterdiscord.DOM.removeStyle();
		Strings.unsubscribe();
		this.clearIcons();
	}
	getSettingsPanel() {
		return BdApi.React.createElement(SettingsPanel, null);
	}
}

module.exports = RoleMentionIcons;

/*@end@*/