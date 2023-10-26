/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 2.1.2
 * @description Moves the User Settings button to left clicking on the user avatar, with the status picker and context menu still available on configurable actions.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
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
		name: "AvatarSettingsButton",
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "2.1.2",
		description: "Moves the User Settings button to left clicking on the user avatar, with the status picker and context menu still available on configurable actions.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
	},
	changelog: [
		{
			title: "Added",
			type: "improved",
			items: [
				"Added French translations (Thanks to Piquixel on GitHub!)"
			]
		},
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed issues with the newest Discord update."
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
		const name = "AvatarSettingsButton";
	
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
	
		// modules/discordmodules.tsx
		const {
			Filters: { byProps }
		} = betterdiscord.Webpack;
		const Error$1 = (_props) => BdApi.React.createElement("div", null, BdApi.React.createElement("h1", {
			style: { color: "red" }
		}, "Error: Component not found"));
		const Common = expectModule({
			filter: byProps("FormSwitch", "RadioGroup", "FormItem", "FormText", "FormDivider"),
			name: "Common",
			fallback: {
				FormSwitch: Error$1,
				RadioGroup: Error$1,
				FormItem: Error$1,
				FormText: Error$1,
				FormDivider: Error$1
			}
		});
		const UserSettingsWindow = expectModule({
			filter: byProps("saveAccountChanges"),
			name: "UserSettingsWindow",
			fatal: true
		});
		const Sections = expectModule({
			filter: byProps("ACCOUNT"),
			searchExports: true,
			name: "Sections",
			fallback: { ACCOUNT: "Account" }
		});
		const accountClasses = expectModule(byProps("buildOverrideButton"), {
			name: "Account Classes",
			fatal: true
		});
		const Margins = getClasses("Margins", ["marginTop20", "marginBottom8"]);
		const tooltipClasses = getClasses("Tooltip Classes", [
			"tooltip",
			"tooltipTop",
			"tooltipPrimary",
			"tooltipPointer",
			"tooltipContent"
		]);
		const layerContainerSelector = getSelectors("Layer Container Class", ["layerContainer"]).layerContainer;
		const appSelector = getSelectors("App Class", ["appAsidePanelWrapper", "app"]).app;
	
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
						return strings[key] || locales[defaultLocale][key];
					},
					enumerable: true,
					configurable: false
				});
			}
			return stringsManager;
		}
	
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
		const Settings = createSettings({
			showTooltip: true,
			click: 1,
			contextmenu: 3,
			middleclick: 2
		});
		const Strings = createStrings(locales, "en-US");
	
		// modules/tooltip.ts
		class Tooltip {
			target;
			tooltip;
			layerContainer;
			ref;
			clearListeners;
			constructor(target, text) {
				this.target = target;
				this.layerContainer = document.querySelector(`${appSelector} ~ ${layerContainerSelector}`);
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
	
		// components/SettingsPanel.tsx
		const { RadioGroup, FormItem, FormText, FormDivider, FormSwitch } = Common;
		function SettingsPanel() {
			const settings = Settings.useSettingsState();
			return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(FormItem, {
				title: Strings.SETTINGS_CLICK
			}, BdApi.React.createElement(FormText, {
				className: Margins.marginBottom8,
				type: "description"
			}, Strings.SETTINGS_CLICK_NOTE), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: `${Strings.SETTINGS_OPTIONS_OPEN_SETTINGS} (${Strings.DEFAULT})`, value: 1 },
					{ name: Strings.SETTINGS_OPTIONS_CONTEXT_MENU, value: 2 },
					{ name: Strings.SETTINGS_OPTIONS_STATUS_PICKER, value: 3 },
					{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 }
				],
				onChange: ({ value }) => Settings.click = value,
				value: settings.click
			}), BdApi.React.createElement(FormDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(FormItem, {
				title: Strings.SETTINGS_RIGHT_CLICK,
				className: Margins.marginTop20
			}, BdApi.React.createElement(FormText, {
				className: Margins.marginBottom8,
				type: "description"
			}, Strings.SETTINGS_RIGHT_CLICK_NOTE), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: Strings.SETTINGS_OPTIONS_OPEN_SETTINGS, value: 1 },
					{ name: Strings.SETTINGS_OPTIONS_CONTEXT_MENU, value: 2 },
					{ name: `${Strings.SETTINGS_OPTIONS_STATUS_PICKER} (${Strings.DEFAULT})`, value: 3 },
					{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 }
				],
				onChange: ({ value }) => Settings.contextmenu = value,
				value: settings.contextmenu
			}), BdApi.React.createElement(FormDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(FormItem, {
				title: Strings.SETTINGS_MIDDLE_CLICK,
				className: Margins.marginTop20
			}, BdApi.React.createElement(FormText, {
				className: Margins.marginBottom8,
				type: "description"
			}, Strings.SETTINGS_MIDDLE_CLICK_NOTE), BdApi.React.createElement(RadioGroup, {
				options: [
					{ name: Strings.SETTINGS_OPTIONS_OPEN_SETTINGS, value: 1 },
					{ name: `${Strings.SETTINGS_OPTIONS_CONTEXT_MENU} (${Strings.DEFAULT})`, value: 2 },
					{ name: Strings.SETTINGS_OPTIONS_STATUS_PICKER, value: 3 },
					{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 }
				],
				onChange: ({ value }) => Settings.middleclick = value,
				value: settings.middleclick
			}), BdApi.React.createElement(FormDivider, {
				className: Margins.marginTop20
			})), BdApi.React.createElement(FormSwitch, {
				className: Margins.marginTop20,
				children: Strings.SETTINGS_TOOLTIP,
				note: Strings.SETTINGS_TOOLTIP_NOTE,
				onChange: (v) => Settings.showTooltip = v,
				value: settings.showTooltip,
				hideBorder: true
			}));
		}
	
		// index.tsx
		const settingsSelector = `.${accountClasses.container} button:nth-last-child(1)`;
		class AvatarSettingsButton extends BasePlugin {
			target = null;
			tooltip = null;
			clearListeners;
			onStart() {
				betterdiscord.DOM.addStyle(`${settingsSelector} { display: none; } .${accountClasses.withTagAsButton} { width: 100%; }`);
				Strings.subscribe();
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
				const tooltips = [
					"",
					Strings.TOOLTIP_USER_SETTINGS,
					Strings.TOOLTIP_SETTINGS_SHORTCUT,
					Strings.TOOLTIP_SET_STATUS
				];
				this.tooltip = new Tooltip(this.target, tooltips[click]);
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				Strings.unsubscribe();
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