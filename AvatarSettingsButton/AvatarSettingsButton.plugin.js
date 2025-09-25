/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 2.2.6
 * @description Moves the User Settings button to left clicking on the user avatar, with the status picker and context menu still available on configurable actions.
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

'use strict';

const betterdiscord = new BdApi("AvatarSettingsButton");
const react = BdApi.React;

// @lib/settings.ts
class SettingsManager {
	settings = betterdiscord.Data.load("settings");
	listeners = new Set();
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
	addListener(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	clearListeners() {
		this.listeners.clear();
	}
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
	get(key) {
		return this.settings[key];
	}
	set(key, value) {
		this.settings[key] = value;
		betterdiscord.Data.save("settings", this.settings);
		for (const listener of this.listeners) listener(key, value);
	}
}
function buildSettingsPanel(settingsManager, settings) {
	for (const setting of settings) {
		setting.value = settingsManager.get(setting.id);
	}
	return betterdiscord.UI.buildSettingsPanel({
		settings,
		onChange: (_, id, value) => settingsManager.set(id, value)
	});
}

// @lib/strings.ts
const LocaleStore = betterdiscord.Webpack.getStore("LocaleStore");
class StringsManager {
	locales;
	defaultLocale;
	strings;
	constructor(locales, defaultLocale) {
		this.locales = locales;
		this.defaultLocale = defaultLocale;
		this.strings = locales[defaultLocale];
	}
	setLocale = () => {
		this.strings = this.locales[LocaleStore.locale] || this.locales[this.defaultLocale];
	};
	subscribe() {
		this.setLocale();
		LocaleStore.addReactChangeListener(this.setLocale);
	}
	unsubscribe() {
		LocaleStore.removeReactChangeListener(this.setLocale);
	}
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
		name
	});
}

// manifest.json
const changelog = [
	{
		title: "Fixed",
		type: "fixed",
		items: [
			"Fixed tooltip and tooltip appearance."
		]
	}
];

// modules/discordmodules.tsx
const accountClasses = expectClasses("Account Classes", ["nameTag", "container", "avatarWrapper"]);
const tooltipClasses = expectClasses("Tooltip Classes", [
	"tooltip",
	"tooltipTop",
	"tooltipPrimary",
	"tooltipPointer",
	"tooltipContent",
	"tooltipPointerBg"
]);
const layerContainerSelector = expectSelectors("Layer Container Class", [
	"layerContainer",
	"layerHidden"
])?.layerContainer;
const appSelector = expectSelectors("App Class", ["appAsidePanelWrapper", "app"])?.app;

// locales.json
const el = {
	TOOLTIP_USER_SETTINGS: "Ρυθμίσεις Χρήστη",
	TOOLTIP_SETTINGS_SHORTCUT: "Συντομεύσεις Ρυθμίσεων",
	TOOLTIP_SET_STATUS: "Ορισμός Κατάστασης",
	DEFAULT: "Προεπιλογή",
	SETTINGS_CLICK: "Με αριστερό πάτημα του ποντικιού",
	SETTINGS_CLICK_NOTE: "Τι ανοίγει όταν πατήσετε στο εικονίδιο του χρήστη. Να ΘΥΜΑΣΤΕ ότι αν δεν οριστεί κάτι να ανοίγει τις ρυθμίσεις, μπορείτε να χρησιμοποιήσετε την συντόμευση «Ctrl + ,».",
	SETTINGS_RIGHT_CLICK: "Με δεξί πάτημα του ποντικιού",
	SETTINGS_RIGHT_CLICK_NOTE: "Τι ανοίγει όταν πατάτε με το δεξιό πλήκτρο του ποντικιού στο εικονίδιο του χρήστη.",
	SETTINGS_MIDDLE_CLICK: "Με μεσσαίο πάτημα του ποντικιού",
	SETTINGS_MIDDLE_CLICK_NOTE: "Τι ανοίγει όταν πατάτε με το μεσσαίο πλήκτρο του ποντικιού στο εικονίδιο του χρήστη.",
	SETTINGS_OPTIONS_OPEN_SETTINGS: "Ρυθμίσεις",
	SETTINGS_OPTIONS_CONTEXT_MENU: "Μενού Περιεχομένου Ρυθμίσεων",
	SETTINGS_OPTIONS_STATUS_PICKER: "Επιλογέας Κατάστασης",
	SETTINGS_OPTIONS_NOTHING: "Τίποτα",
	SETTINGS_TOOLTIP: "Επεξηγηση",
	SETTINGS_TOOLTIP_NOTE: "Εμφάνιση επεξήγησης όταν μεταβαίνει ο δείκτης του ποντικιού πάνω από το εικονίδιο του χρήστη."
};
const fr = {
	TOOLTIP_USER_SETTINGS: "Paramètres utilisateur",
	TOOLTIP_SETTINGS_SHORTCUT: "Raccourcis de Paramètres",
	TOOLTIP_SET_STATUS: "Définir le status",
	DEFAULT: "Par défaut",
	SETTINGS_CLICK: "Clic",
	SETTINGS_CLICK_NOTE: "Ce qui s'ouvre en cliquant sur l'avatar utilisateur. RAPPEL Si rien n'est défini pour ouvrir les paramètres, vous pouvez utiliser le raccourcis Ctrl + ,.",
	SETTINGS_RIGHT_CLICK: "Clic Droit",
	SETTINGS_RIGHT_CLICK_NOTE: "Ce qui s'ouvre en cliquant droit sur l'avatar utilisateur.",
	SETTINGS_MIDDLE_CLICK: "Clic Molette",
	SETTINGS_MIDDLE_CLICK_NOTE: "Ce qui s'ouvre en cliquant sur la molette sur l'avatar utilisateur.",
	SETTINGS_OPTIONS_OPEN_SETTINGS: "Paramètres",
	SETTINGS_OPTIONS_CONTEXT_MENU: "Menu Contextuel des Paramètres",
	SETTINGS_OPTIONS_STATUS_PICKER: "Sélecteur de status",
	SETTINGS_OPTIONS_NOTHING: "Rien",
	SETTINGS_TOOLTIP: "Info-bulle",
	SETTINGS_TOOLTIP_NOTE: "Affiche une info-bulle en passant au-dessus de l'avatar utilisateur."
};
const locales = {
	"en-US": {
	TOOLTIP_USER_SETTINGS: "User Settings",
	TOOLTIP_SETTINGS_SHORTCUT: "Settings Shortcuts",
	TOOLTIP_SET_STATUS: "Set Status",
	DEFAULT: "Default",
	SETTINGS_CLICK: "Click",
	SETTINGS_CLICK_NOTE: "What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can use the Ctrl + , shortcut.",
	SETTINGS_RIGHT_CLICK: "Right Click",
	SETTINGS_RIGHT_CLICK_NOTE: "What opens when right clicking on the user avatar.",
	SETTINGS_MIDDLE_CLICK: "Middle Click",
	SETTINGS_MIDDLE_CLICK_NOTE: "What opens when middle clicking on the user avatar.",
	SETTINGS_OPTIONS_OPEN_SETTINGS: "Settings",
	SETTINGS_OPTIONS_CONTEXT_MENU: "Settings Context Menu",
	SETTINGS_OPTIONS_STATUS_PICKER: "Status Picker",
	SETTINGS_OPTIONS_NOTHING: "Nothing",
	SETTINGS_TOOLTIP: "Tooltip",
	SETTINGS_TOOLTIP_NOTE: "Show tooltip when hovering over user avatar."
},
	el: el,
	fr: fr
};

// modules/utils.ts
const Settings = new SettingsManager({
	showTooltip: true,
	click: 1,
	contextmenu: 3,
	middleclick: 2
});
const Strings = new StringsManager(locales, "en-US");

// modules/tooltip.ts
class Tooltip {
	target;
	tooltip;
	layerContainer;
	ref = null;
	clearListeners;
	constructor(target, text) {
		this.target = target;
		this.layerContainer = document.querySelector(`${appSelector} ~ ${layerContainerSelector}`);
		const pointerBg = document.createElement("div");
		pointerBg.className = tooltipClasses.tooltipPointerBg + " " + tooltipClasses.tooltipPointer;
		pointerBg.style.left = "calc(50% + 0px)";
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
		this.tooltip.appendChild(pointerBg);
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
		if (!ref) return;
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

// index.tsx
const settingsSelector = `.${accountClasses.container} button:last-of-type:not(:first-child)`;
class AvatarSettingsButton {
	meta;
	target = null;
	tooltip = null;
	clearListener;
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(`${settingsSelector} { display: none; } .${accountClasses.avatarWrapper} { width: 100%; }`);
		Strings.subscribe();
		Settings.addListener(() => {
			this.addListener();
			this.addTooltip();
		});
		this.target = document.querySelector("." + accountClasses.avatarWrapper);
		this.addListener();
		this.addTooltip();
	}
	observer({ addedNodes }) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			if (!(node instanceof HTMLElement)) continue;
			const avatarWrapper = node.className.includes(accountClasses.avatarWrapper) ? node : node.querySelector(`.${accountClasses.avatarWrapper}`);
			if (avatarWrapper instanceof HTMLElement) {
				this.target = avatarWrapper;
				this.addListener();
				this.addTooltip();
			}
		}
	}
	openPopout() {
		this.target?.dispatchEvent(
			new MouseEvent("click", {
				bubbles: true
			})
		);
	}
	openSettings() {
		UserSettingsWindow?.setSection(SettingsSections.ACCOUNT);
		UserSettingsWindow?.open();
	}
	openContextMenu(e) {
		document.querySelector(settingsSelector)?.dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: e.clientX,
				clientY: screen.height - 12
			})
		);
	}
	addListener() {
		if (!this.target) return;
		this.clearListener?.();
		const actions = [
			null,
			this.openSettings.bind(this),
			this.openContextMenu.bind(this),
			this.openPopout.bind(this)
		];
		const clickAction = actions[Settings.get("click")];
		const contextmenuAction = actions[Settings.get("contextmenu")];
		const middleclickAction = actions[Settings.get("middleclick")];
		const clickHandler = (e) => {
			if (e.button == 0 && e.isTrusted) {
				e.preventDefault();
				e.stopPropagation();
				clickAction?.(e);
			} else if (e.button == 2) contextmenuAction?.(e);
			else if (e.button == 1) middleclickAction?.(e);
			this.tooltip?.forceHide();
		};
		this.target.addEventListener("mousedown", clickHandler);
		this.clearListener = () => {
			this.target?.removeEventListener("mousedown", clickHandler);
		};
	}
	addTooltip() {
		if (!this.target) return;
		this.tooltip?.remove();
		this.tooltip = null;
		if (!Settings.get("showTooltip")) return;
		const click = Settings.get("click");
		if (click === 0) return;
		const tooltips = [
			"",
			Strings.get("TOOLTIP_USER_SETTINGS"),
			Strings.get("TOOLTIP_SETTINGS_SHORTCUT"),
			Strings.get("TOOLTIP_SET_STATUS")
		];
		this.tooltip = new Tooltip(this.target, tooltips[click]);
	}
	stop() {
		betterdiscord.DOM.removeStyle();
		Strings.unsubscribe();
		Settings.clearListeners();
		this.clearListener?.();
		this.tooltip?.remove();
		this.target = null;
		this.tooltip = null;
	}
	getSettingsPanel() {
		return buildSettingsPanel(Settings, [
			{
				id: "click",
				type: "radio",
				name: Strings.get("SETTINGS_CLICK"),
				note: Strings.get("SETTINGS_CLICK_NOTE"),
				options: [
					{
						name: `${Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS")} (${Strings.get("DEFAULT")})`,
						value: 1
					},
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 }
				]
			},
			{
				id: "contextmenu",
				type: "radio",
				name: Strings.get("SETTINGS_RIGHT_CLICK"),
				note: Strings.get("SETTINGS_RIGHT_CLICK_NOTE"),
				options: [
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_STATUS_PICKER")} (${Strings.get("DEFAULT")})`,
						value: 3
					},
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 }
				]
			},
			{
				id: "middleclick",
				type: "radio",
				name: Strings.get("SETTINGS_MIDDLE_CLICK"),
				note: Strings.get("SETTINGS_MIDDLE_CLICK_NOTE"),
				options: [
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU")} (${Strings.get("DEFAULT")})`,
						value: 2
					},
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 }
				]
			},
			{
				id: "showTooltip",
				type: "switch",
				name: Strings.get("SETTINGS_TOOLTIP"),
				note: Strings.get("SETTINGS_TOOLTIP_NOTE")
			}
		]);
	}
}

module.exports = AvatarSettingsButton;

/*@end@*/