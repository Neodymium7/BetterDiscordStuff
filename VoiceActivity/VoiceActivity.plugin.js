/**
 * @name VoiceActivity
 * @author Neodymium
 * @description Shows icons and info in popouts, the member list, and more when someone is in a voice channel.
 * @version 1.6.4
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/VoiceActivity/VoiceActivity.plugin.js
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
		authors: [
			{
				name: "Neodymium"
			}
		],
		version: "1.6.4",
		description: "Shows icons and info in popouts, the member list, and more when someone is in a voice channel.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/VoiceActivity/VoiceActivity.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/VoiceActivity/VoiceActivity.plugin.js"
	},
	changelog: [
		{
			title: "Fixed",
			type: "fixed",
			items: [
				"Fixed ignore context menu option appearing on all channels (not just voice channels).",
				"Fixed titles of unnamed group DMs."
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
    var Plugin = (function (betterdiscord, react, zlibrary, BasePlugin) {
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
		var Dispatcher = betterdiscord.Webpack.getModule(betterdiscord.Webpack.Filters.byProps("dispatch", "subscribe"));
		var LocaleManager = betterdiscord.Webpack.getModule((m) => m.Messages?.CLOSE);
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
		var WebpackUtils = {
			store(name) {
				return (m) => m.getName?.() === name;
			},
			byId(id) {
				return (_e, _m, i) => i === id;
			},
			byValues(...filters) {
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
			},
			getModuleWithKey(filter) {
				let target;
				let id;
				let key;
				betterdiscord.Webpack.getModule(
					(e, m, i) => {
						if (filter(e, m, i)) {
							target = m;
							id = i;
							return true;
						}
						return false;
					},
					{ searchExports: true }
				);
				for (const k in target.exports) {
					if (filter(target.exports[k], target, id)) {
						key = k;
						break;
					}
				}
				return [target.exports, key];
			}
		};
	
		// styles
		let _styles = "";
		function _loadStyle(path, css) {
			_styles += "/*" + path + "*/\n" + css + "\n";
		}
		function styles() {
			return _styles;
		}
	
		// locales.json
		var ru = {
			SETTINGS_PROFILE: "Раздел в Профиле",
			SETTINGS_PROFILE_NOTE: "Показывает раздел для текущей голосовой активности в профиле, всплывающих окнах и боковых панелях в ЛС.",
			SETTINGS_ICONS: "Иконки в Списке Участников",
			SETTINGS_ICONS_NOTE: "Показывает иконки в списке участников когда пользователь в голосовом канале.",
			SETTINGS_DM_ICONS: "Иконки в ЛС",
			SETTINGS_DM_ICONS_NOTE: "Показывает иконки в списке участников ЛС когда пользователь в голосовом канале.",
			SETTINGS_PEOPLE_ICONS: "Иконки в Списке Друзей",
			SETTINGS_PEOPLE_ICONS_NOTE: "Показывает иконки в списке друзей когда пользователь в голосовом канале.",
			SETTINGS_GUILD_ICONS: "Иконки Сервера",
			SETTINGS_GUILD_ICONS_NOTE: "Показывает голосовые иконки на серверах даже когда вы не участвуете.",
			SETTINGS_COLOR: "Цвет Иконки Голосовой Активности",
			SETTINGS_COLOR_NOTE: "Делает иконки в Списке Участников зелёными когда пользователь в голосовом канале вместе с вами.",
			SETTINGS_STATUS: "Показывать Иконки Статуса",
			SETTINGS_STATUS_NOTE: "Меняет иконки в Списке Участников когда пользователь Выключил Микрофон/Звук или Начал трансляцию.",
			SETTINGS_IGNORE: "Ингор",
			SETTINGS_IGNORE_NOTE: "Добавляет возможность в контекстных меню Голосовых Каналов и Серверов игнорировать этот канал/сервер в Списке Участников и Профилях Пользователей.",
			CONTEXT_IGNORE: "Игнор (Голосовая Активность)",
			VOICE_CALL: "Голосовой звонок",
			PRIVATE_CALL: "Приватный звонок",
			GROUP_CALL: "Групповой звонок",
			LIVE: "В ЭФИРЕ",
			HEADER: "В Голосовом Канале",
			HEADER_VOICE: "В Голосовом Звонке",
			HEADER_PRIVATE: "В Приватном Звонке",
			HEADER_GROUP: "В Групповом Звонке",
			HEADER_STAGE: "В Канале Трибуны",
			VIEW: "Просмотреть Канал",
			VIEW_CALL: "Просмотреть Звонок",
			JOIN: "Присоединиться к Каналу",
			JOIN_CALL: "Присоединиться к Звонку",
			JOIN_DISABLED: "Уже в Канале",
			JOIN_DISABLED_CALL: "Уже в Звонке",
			JOIN_VIDEO: "Присоединиться с Видео"
		};
		var de = {
			SETTINGS_PROFILE: "Profilbereich",
			SETTINGS_PROFILE_NOTE: "Zeigt den Profilbereich für die aktuelle Sprachaktivität in Benutzer-Popouts und DM-Profilseitenleisten an.",
			SETTINGS_ICONS: "Symbole in der Mitgliederliste",
			SETTINGS_ICONS_NOTE: "Zeigt Symbole in der Mitgliederliste an, wenn sich jemand in einem Sprachkanal befindet.",
			SETTINGS_DM_ICONS: "DM-Symbole",
			SETTINGS_DM_ICONS_NOTE: "Zeigt Symbole in der DM-Liste an, wenn sich jemand in einem Sprachkanal befindet.",
			SETTINGS_PEOPLE_ICONS: "Symbole in der Freundesliste",
			SETTINGS_PEOPLE_ICONS_NOTE: "Zeigt Symbole in der Freundesliste an, wenn sich jemand in einem Sprachkanal befindet.",
			SETTINGS_GUILD_ICONS: "Gildensymbole",
			SETTINGS_GUILD_ICONS_NOTE: "Zeigt Symbole für Gilden an, auch wenn du nicht teilnimmst.",
			SETTINGS_COLOR: "Mitgliederliste - Farbe des aktuellen Kanalsymbols",
			SETTINGS_COLOR_NOTE: "Die Symbole in der Mitgliederliste werden grün, wenn sich der Benutzer in Ihrem aktuellen Sprachkanal befindet.",
			SETTINGS_STATUS: "Mitgliederliste - Statussymbole anzeigen",
			SETTINGS_STATUS_NOTE: "Ändert die Symbole in der Mitgliederliste, wenn ein Benutzer stummgeschaltet oder mit aktiviertem Video ist.",
			SETTINGS_IGNORE: "Ignorieren",
			SETTINGS_IGNORE_NOTE: "Fügt eine Option in die Kontextmenüs von Sprachkanälen und Gilden hinzu, um diesen Kanal/diese Gilde in der Mitgliederliste und Benutzer-Popouts zu ignorieren.",
			CONTEXT_IGNORE: "Bei Sprachaktivität ignorieren",
			VOICE_CALL: "Sprachanruf",
			PRIVATE_CALL: "Privatanruf",
			GROUP_CALL: "Gruppenanruf",
			LIVE: "Live",
			HEADER: "In einem Sprachkanal",
			HEADER_VOICE: "In einem Sprachanruf",
			HEADER_PRIVATE: "In einem privaten Anruf",
			HEADER_GROUP: "In einem Gruppenruf",
			HEADER_STAGE: "In einem Stage Kanal",
			VIEW: "Kanal anzeigen",
			VIEW_CALL: "Anruf anzeigen",
			JOIN: "Kanal beitreten",
			JOIN_CALL: "Anruf beitreten",
			JOIN_DISABLED: "Bereits im Kanal",
			JOIN_DISABLED_CALL: "Bereits im Aufruf",
			JOIN_VIDEO: "Beitreten mit Video"
		};
		var locales = {
			"en-US": {
			SETTINGS_PROFILE: "Profile Section",
			SETTINGS_PROFILE_NOTE: "Shows profile section for current voice activity in user popouts and DM profile sidebars.",
			SETTINGS_ICONS: "Member List Icons",
			SETTINGS_ICONS_NOTE: "Shows icons on the member list when someone is in a voice channel.",
			SETTINGS_DM_ICONS: "DM Icons",
			SETTINGS_DM_ICONS_NOTE: "Shows icons on the DM list when someone is in a voice channel.",
			SETTINGS_PEOPLE_ICONS: "Friends List Icons",
			SETTINGS_PEOPLE_ICONS_NOTE: "Shows icons on the friends list when someone is in a voice channel.",
			SETTINGS_GUILD_ICONS: "Guild Icons",
			SETTINGS_GUILD_ICONS_NOTE: "Shows voice icons on guilds even when you're not participating.",
			SETTINGS_COLOR: "Member List - Current Channel Icon Color",
			SETTINGS_COLOR_NOTE: "Makes the Member List icons green when the user is in your current voice channel.",
			SETTINGS_STATUS: "Member List - Show Status Icons",
			SETTINGS_STATUS_NOTE: "Changes the Member List icons when a user is Muted, Deafened, or has Video enabled.",
			SETTINGS_IGNORE: "Ignore",
			SETTINGS_IGNORE_NOTE: "Adds an option on Voice Channel and Guild context menus to ignore that channel/guild in Member List Icons and User Popouts.",
			CONTEXT_IGNORE: "Ignore in Voice Activity",
			VOICE_CALL: "Voice Call",
			PRIVATE_CALL: "Private Call",
			GROUP_CALL: "Group Call",
			LIVE: "Live",
			HEADER: "In a Voice Channel",
			HEADER_VOICE: "In a Voice Call",
			HEADER_PRIVATE: "In a Private Call",
			HEADER_GROUP: "In a Group Call",
			HEADER_STAGE: "In a Stage Channel",
			VIEW: "View Channel",
			VIEW_CALL: "View Call",
			JOIN: "Join Channel",
			JOIN_CALL: "Join Call",
			JOIN_DISABLED: "Already in Channel",
			JOIN_DISABLED_CALL: "Already in Call",
			JOIN_VIDEO: "Join With Video"
		},
			ru: ru,
			de: de
		};
	
		// utils.ts
		const {
			Filters: { byProps: byProps$1, byStrings: byStrings$4 },
			getModule: getModule$6
		} = betterdiscord.Webpack;
		const { Permissions, UserStore: UserStore$2 } = zlibrary.DiscordModules;
		const DiscordPermissions = getModule$6(byProps$1("VIEW_CREATOR_MONETIZATION_ANALYTICS"), { searchExports: true });
		const Settings = createSettings({
			showProfileSection: true,
			showMemberListIcons: true,
			showDMListIcons: true,
			showPeopleListIcons: true,
			showGuildIcons: true,
			currentChannelColor: true,
			showStatusIcons: true,
			ignoreEnabled: false,
			ignoredChannels: [],
			ignoredGuilds: []
		});
		const Strings = createStrings(locales, "en-US");
		const useStateFromStores = getModule$6(byStrings$4("useStateFromStores"));
		const transitionTo = getModule$6(byStrings$4("transitionTo -"), { searchExports: true });
		const VoiceStateStore = getModule$6(byProps$1("getVoiceStateForUser"));
		const GuildStore = getModule$6(byProps$1("getGuildCount"));
		function checkPermissions(channel) {
			return Permissions.can({
				permission: DiscordPermissions.VIEW_CHANNEL,
				user: UserStore$2.getCurrentUser(),
				context: channel
			});
		}
		function forceUpdateAll(selector) {
			const elements = document.querySelectorAll(selector);
			for (const element of elements) {
				const stateNodes = zlibrary.ReactTools.getStateNodes(element);
				for (const stateNode of stateNodes)
					stateNode.forceUpdate();
			}
		}
		function groupDMName(members) {
			if (members.length === 1) {
				return UserStore$2.getUser(members[0]).username;
			} else if (members.length > 1) {
				let name = "";
				for (let i = 0; i < members.length; i++) {
					if (i === members.length - 1)
						name += UserStore$2.getUser(members[i]).username;
					else
						name += UserStore$2.getUser(members[i]).username + ", ";
				}
				return name;
			}
			return "Unnamed";
		}
		function forceRerender(element) {
			const ownerInstance = betterdiscord.ReactUtils.getOwnerInstance(element);
			const cancel = betterdiscord.Patcher.instead(ownerInstance, "render", () => {
				cancel();
				return null;
			});
			ownerInstance.forceUpdate(() => ownerInstance.forceUpdate());
		}
	
		// styles/voiceicon.module.scss
		var css$2 = ".VoiceActivity-voiceicon-icon {\n  height: 20px;\n  width: 20px;\n  min-width: 20px;\n  border-radius: 50%;\n  background-color: var(--background-floating);\n  cursor: pointer;\n}\n.VoiceActivity-voiceicon-icon:hover {\n  background-color: var(--background-tertiary);\n}\n.VoiceActivity-voiceicon-icon svg {\n  padding: 3px;\n  color: var(--interactive-normal);\n}\n\n.VoiceActivity-voiceicon-iconCurrentCall {\n  background-color: var(--status-positive);\n}\n.VoiceActivity-voiceicon-iconCurrentCall:hover {\n  background-color: var(--button-positive-background);\n}\n.VoiceActivity-voiceicon-iconCurrentCall svg {\n  color: #fff;\n}\n\n.VoiceActivity-voiceicon-iconLive {\n  height: 16px;\n  border-radius: 16px;\n  background-color: var(--status-danger);\n  color: #fff;\n  font-size: 12px;\n  line-height: 16px;\n  font-weight: 600;\n  font-family: var(--font-display);\n  text-transform: uppercase;\n}\n.VoiceActivity-voiceicon-iconLive:hover {\n  background-color: var(--button-danger-background);\n}\n.VoiceActivity-voiceicon-iconLive > div {\n  padding: 0 6px;\n}\n\n.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-header {\n  display: block;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext {\n  display: flex;\n  flex-direction: row;\n  margin-top: 3px;\n}\n.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext > div {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-tooltipIcon {\n  min-width: 16px;\n  margin-right: 3px;\n  color: var(--interactive-normal);\n}\n\n.VoiceActivity-voiceicon-iconContainer {\n  margin-left: auto;\n}\n.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-icon {\n  margin-right: 8px;\n}\n.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-iconLive {\n  margin-right: 8px;\n}";
		_loadStyle("voiceicon.module.scss", css$2);
		var modules_df1df857 = {"icon":"VoiceActivity-voiceicon-icon","iconCurrentCall":"VoiceActivity-voiceicon-iconCurrentCall","iconLive":"VoiceActivity-voiceicon-iconLive","tooltip":"VoiceActivity-voiceicon-tooltip","header":"VoiceActivity-voiceicon-header","subtext":"VoiceActivity-voiceicon-subtext","tooltipIcon":"VoiceActivity-voiceicon-tooltipIcon","iconContainer":"VoiceActivity-voiceicon-iconContainer"};
	
		// components/Tooltip.tsx
		const {
			Filters: { byPrototypeFields },
			getModule: getModule$5
		} = betterdiscord.Webpack;
		const Tooltip = getModule$5(byPrototypeFields("renderTooltip"));
	
		// components/icons.tsx
		const {
			Filters: { byStrings: byStrings$3 },
			getModule: getModule$4
		} = betterdiscord.Webpack;
		const CallJoin = getModule$4(byStrings$3("M11 5V3C16.515 3 21 7.486"));
		const People = getModule$4(byStrings$3("M14 8.00598C14 10.211 12.206 12.006"));
		const Speaker = getModule$4(byStrings$3("M11.383 3.07904C11.009 2.92504 10.579 3.01004"));
		const Muted = getModule$4(byStrings$3("M6.7 11H5C5 12.19 5.34 13.3"));
		const Deafened = getModule$4(byStrings$3("M6.16204 15.0065C6.10859 15.0022 6.05455 15"));
		const Video = getModule$4(byStrings$3("M21.526 8.149C21.231 7.966 20.862 7.951"));
		const Stage = getModule$4(
			byStrings$3(
				"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
			)
		);
	
		// components/VoiceIcon.tsx
		const { ChannelStore: ChannelStore$1, UserStore: UserStore$1 } = zlibrary.DiscordModules;
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
			const voiceState = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(props.userId));
			const currentUserVoiceState = useStateFromStores(
				[VoiceStateStore],
				() => VoiceStateStore.getVoiceStateForUser(UserStore$1.getCurrentUser()?.id)
			);
			if (props.context === "memberlist" && !showMemberListIcons)
				return null;
			if (props.context === "dmlist" && !showDMListIcons)
				return null;
			if (props.context === "peoplelist" && !showPeopleListIcons)
				return null;
			if (!voiceState)
				return null;
			const channel = ChannelStore$1.getChannel(voiceState.channelId);
			if (!channel)
				return null;
			const guild = GuildStore.getGuild(channel.guild_id);
			if (guild && !checkPermissions(channel))
				return null;
			if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id)))
				return null;
			let text;
			let subtext;
			let TooltipIcon;
			let channelPath;
			let className = modules_df1df857.icon;
			if (channel.id === currentUserVoiceState?.channelId && currentChannelColor)
				className = `${modules_df1df857.icon} ${modules_df1df857.iconCurrentCall}`;
			if (voiceState.selfStream)
				className = modules_df1df857.iconLive;
			if (guild) {
				text = guild.name;
				subtext = channel.name;
				TooltipIcon = Speaker;
				channelPath = `/channels/${guild.id}/${channel.id}`;
			} else {
				text = channel.name;
				subtext = Strings.VOICE_CALL;
				TooltipIcon = CallJoin;
				channelPath = `/channels/@me/${channel.id}`;
			}
			switch (channel.type) {
				case 1:
					text = UserStore$1.getUser(channel.recipients[0]).username;
					subtext = Strings.PRIVATE_CALL;
					break;
				case 3:
					text = channel.name || groupDMName(channel.recipients);
					subtext = Strings.GROUP_CALL;
					TooltipIcon = People;
					break;
				case 13:
					TooltipIcon = Stage;
			}
			let Icon = Speaker;
			if (showStatusIcons && (voiceState.selfDeaf || voiceState.deaf))
				Icon = Deafened;
			else if (showStatusIcons && (voiceState.selfMute || voiceState.mute))
				Icon = Muted;
			else if (showStatusIcons && voiceState.selfVideo)
				Icon = Video;
			return BdApi.React.createElement("div", {
				className,
				onClick: (e) => {
					e.stopPropagation();
					e.preventDefault();
					if (channelPath)
						transitionTo(channelPath);
				}
			}, BdApi.React.createElement(Tooltip, {
				text: BdApi.React.createElement("div", {
					className: modules_df1df857.tooltip
				}, BdApi.React.createElement("div", {
					className: modules_df1df857.header,
					style: { fontWeight: "600" }
				}, text), BdApi.React.createElement("div", {
					className: modules_df1df857.subtext
				}, BdApi.React.createElement(TooltipIcon, {
					className: modules_df1df857.tooltipIcon,
					width: "16",
					height: "16"
				}), BdApi.React.createElement("div", {
					style: { fontWeight: "400" }
				}, subtext)))
			}, (props2) => BdApi.React.createElement("div", {
				...props2
			}, !voiceState.selfStream ? BdApi.React.createElement(Icon, {
				width: "14",
				height: "14"
			}) : Strings.LIVE)));
		}
	
		// styles/voiceprofilesection.module.scss
		var css$1 = ".VoiceActivity-voiceprofilesection-header {\n  margin-bottom: 8px;\n  color: var(--header-primary);\n  font-size: 12px;\n  line-height: 16px;\n  font-family: var(--font-display);\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.VoiceActivity-voiceprofilesection-body {\n  display: flex;\n  flex-direction: row;\n}\n\n.VoiceActivity-voiceprofilesection-text {\n  margin: auto 10px;\n  color: var(--text-normal);\n  font-size: 14px;\n  line-height: 18px;\n  overflow: hidden;\n}\n.VoiceActivity-voiceprofilesection-text > div, .VoiceActivity-voiceprofilesection-text > h3 {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.VoiceActivity-voiceprofilesection-text > h3 {\n  font-family: var(--font-normal);\n  font-weight: 600;\n}\n\n.VoiceActivity-voiceprofilesection-buttonWrapper {\n  display: flex;\n  flex: 0 1 auto;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: stretch;\n  margin-top: 12px;\n}\n.VoiceActivity-voiceprofilesection-buttonWrapper > div[aria-label] {\n  width: 32px;\n  margin-left: 8px;\n}\n\n.VoiceActivity-voiceprofilesection-button {\n  height: 32px;\n  min-height: 32px;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 2px 16px;\n  border-radius: 3px;\n  color: #fff;\n  font-size: 14px;\n  line-height: 16px;\n  font-weight: 500;\n  user-select: none;\n  background-color: var(--profile-gradient-button-color);\n  transition: opacity 0.2s ease-in-out;\n}\n.VoiceActivity-voiceprofilesection-button:hover {\n  opacity: 0.8;\n}\n.VoiceActivity-voiceprofilesection-button:active {\n  opacity: 0.9;\n}\n.VoiceActivity-voiceprofilesection-button:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.VoiceActivity-voiceprofilesection-joinWrapper .VoiceActivity-voiceprofilesection-joinButton {\n  min-width: 32px;\n  max-width: 32px;\n  padding: 0;\n}\n.VoiceActivity-voiceprofilesection-joinWrapper .VoiceActivity-voiceprofilesection-joinButton:disabled {\n  pointer-events: none;\n}\n\n.VoiceActivity-voiceprofilesection-joinWrapperDisabled {\n  cursor: not-allowed;\n}";
		_loadStyle("voiceprofilesection.module.scss", css$1);
		var modules_9dbd3268 = {"header":"VoiceActivity-voiceprofilesection-header","body":"VoiceActivity-voiceprofilesection-body","text":"VoiceActivity-voiceprofilesection-text","buttonWrapper":"VoiceActivity-voiceprofilesection-buttonWrapper","button":"VoiceActivity-voiceprofilesection-button","joinWrapper":"VoiceActivity-voiceprofilesection-joinWrapper","joinButton":"VoiceActivity-voiceprofilesection-joinButton","joinWrapperDisabled":"VoiceActivity-voiceprofilesection-joinWrapperDisabled"};
	
		// styles/guildimage.module.scss
		var css = ".VoiceActivity-guildimage-defaultIcon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 500;\n  line-height: 1.2em;\n  white-space: nowrap;\n  background-color: var(--background-primary);\n  color: var(--text-normal);\n  min-width: 48px;\n  width: 48px;\n  height: 48px;\n  border-radius: 16px;\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n}";
		_loadStyle("guildimage.module.scss", css);
		var modules_1a1e8d51 = {"defaultIcon":"VoiceActivity-guildimage-defaultIcon"};
	
		// assets/default_group_icon.png
		var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAABgmlDQ1BJQ0MgUHJvZmlsZQAAKM+VkTtIw1AYhb9WxQcVBzuIOGSoThZERRyliiIolFrB12CS2io0sSQtLo6Cq+DgY7Hq4OKsq4OrIAg+QBydnBRdROJ/U6FFqOCFcD/OzTnce34IFrOm5db2gGXnncRYTJuZndPqn6mlBmikTzfd3OTUaJKq6+OWgNpvoiqL/63m1JJrQkATHjJzTl54UXhgLZ9TvCscNpf1lPCpcLcjFxS+V7pR4hfFGZ+DKjPsJBPDwmFhLVPBRgWby44l3C8cSVm25AdnSpxSvK7YyhbMn3uqF4aW7OkppcvXwRjjTBJHw6DAClnyRGW3RXFJyHmsir/d98fFZYhrBVMcI6xioft+1Ax+d+um+3pLSaEY1D153lsn1G/D15bnfR563tcR1DzChV32rxZh8F30rbIWOYCWDTi7LGvGDpxvQttDTnd0X1LzD6bT8HoiY5qF1mtomi/19nPO8R0kpauJK9jbh66MZC9UeXdDZW9//uP3R+wbNjlyjzeozyoAAABgUExURVhl8oGK9LW7+erq/f///97i+7/F+mx38qGo92Ft8mFv8ujs/IuW9PP2/Wx384GM9Kux+MDF+urs/d/i+7S9+Jae9uDj/Jad9srO+tXY+4yU9aqy+MDE+qGn9/T1/neC9Liz/RcAAAAJcEhZcwAACxMAAAsTAQCanBgAAATqaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPg0KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmIzMjk5M2JmLTliZTUtNGJmMy04ZWEwLWY3ZDkzNTMyMTY2YiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNjhkOWE3MS1lYWU3LTRmZjAtYmMxZS04MGUwYmMxMTFkZDUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplZjU1ZGE0YS0wZTBhLTRjNTctODdmOC1lMmFmMGUyZGEzOGUiIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIiBHSU1QOkFQST0iMi4wIiBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIiBHSU1QOlRpbWVTdGFtcD0iMTY0ODk0NDg1NjM4ODc5MSIgR0lNUDpWZXJzaW9uPSIyLjEwLjI0IiB0aWZmOk9yaWVudGF0aW9uPSIxIiB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+DQogICAgICA8eG1wTU06SGlzdG9yeT4NCiAgICAgICAgPHJkZjpTZXE+DQogICAgICAgICAgPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ3NmFhOGE3LTVhNGEtNDcyNS05YTBjLWU1NzVmMzE1MzFmOCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIgc3RFdnQ6d2hlbj0iMjAyMi0wNC0wMlQxNzoxNDoxNiIgLz4NCiAgICAgICAgPC9yZGY6U2VxPg0KICAgICAgPC94bXBNTTpIaXN0b3J5Pg0KICAgIDwvcmRmOkRlc2NyaXB0aW9uPg0KICA8L3JkZjpSREY+DQo8L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9InIiPz6JoorbAAABV0lEQVRoQ+3W23KDIBAGYIOYBk20prWNPb7/W3Z3WQ9lGmeKe/l/N/+IzAYDggUAAAAAAMB/HVzpfXV8kIuTpp3gvHJ8WTcx7VRanlSBrs+aVubxMxn7RdNGq6VVR02Pmjb6WHjCQ+80baxmgDXUxA/FaSPWXUxtctOCVF2Z2uSmhauUnT1RU61p49cq9b6npoOmDV4yK7xN8G8abhfPsXIkq7MxfdGKOt0qBuOtoqjnZ3BcN9BmZ1qftP2L91cXt4ezJszCq7uVtENfytEN1ocZLZlRJ1iNQ2zvNHd6oyWfamLpd809wofWTBxllY6a+UJyFCzkPWsve9+35N9fG/k+nZySufjkveuTOvCuzZmp/WN+F1/859AjSuahLW0LD/2kmWdjBtiNunxr5kmOyhR/VfAk5H9dxDr3TX2kcw6psmHqI51zSJUNUx/pDAAAAAAAsKkofgB06RBbh+d86AAAAABJRU5ErkJggg==";
	
		// components/GuildImage.tsx
		const {
			Filters: { byStrings: byStrings$2 },
			getModule: getModule$3
		} = betterdiscord.Webpack;
		const { GuildActions } = zlibrary.DiscordModules;
		const getAcronym = getModule$3(byStrings$2(`.replace(/'s /g," ").replace(/\\w+/g,`), { searchExports: true });
		const getIconFontSize = (name) => {
			const words = name.split(" ");
			if (words.length > 7)
				return 10;
			else if (words.length === 6)
				return 12;
			else if (words.length === 5)
				return 14;
			else
				return 16;
		};
		const getImageLink = (guild, channel) => {
			let image;
			if (guild && guild.icon) {
				image = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`;
			} else if (channel.icon) {
				image = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
			} else if (channel.type === 3) {
				image = img;
			}
			return image;
		};
		function GuildImage(props) {
			const image = getImageLink(props.guild, props.channel);
			if (image) {
				return BdApi.React.createElement("img", {
					className: modules_1a1e8d51.icon,
					src: image,
					width: "48",
					height: "48",
					style: { borderRadius: "16px", cursor: "pointer" },
					onClick: () => {
						if (props.guild)
							GuildActions.transitionToGuildSync(props.guild.id);
						else if (props.channelPath)
							transitionTo(props.channelPath);
					}
				});
			} else {
				return BdApi.React.createElement("div", {
					className: modules_1a1e8d51.defaultIcon,
					onClick: () => {
						if (props.guild)
							GuildActions.transitionToGuildSync(props.guild.id);
						else if (props.channelPath)
							transitionTo(props.channelPath);
					},
					style: { fontSize: `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }
				}, getAcronym(props.guild ? props.guild.name : props.guild.id));
			}
		}
	
		// components/VoiceProfileSection.tsx
		const {
			getModule: getModule$2,
			Filters: { byStrings: byStrings$1 }
		} = betterdiscord.Webpack;
		const { ChannelActions, ChannelStore, SelectedChannelStore, UserStore } = zlibrary.DiscordModules;
		const UserPopoutSection = getModule$2(byStrings$1(".lastSection", ".children"));
		function VoiceProfileSection(props) {
			const { showProfileSection, ignoreEnabled, ignoredChannels, ignoredGuilds } = Settings.useSettingsState();
			const voiceState = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(props.userId));
			const currentUserVoiceState = useStateFromStores(
				[VoiceStateStore],
				() => VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser()?.id)
			);
			if (!showProfileSection)
				return null;
			if (!voiceState)
				return null;
			const channel = ChannelStore.getChannel(voiceState.channelId);
			if (!channel)
				return null;
			const guild = GuildStore.getGuild(channel.guild_id);
			if (guild && !checkPermissions(channel))
				return null;
			if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id)))
				return null;
			let headerText;
			let text;
			let viewButton;
			let joinButton;
			let Icon;
			let channelPath;
			const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
			const channelSelected = channel.id === SelectedChannelStore.getChannelId();
			const isCurrentUser = props.userId === UserStore.getCurrentUser().id;
			if (guild) {
				headerText = Strings.HEADER;
				text = [BdApi.React.createElement("h3", null, guild.name), BdApi.React.createElement("div", null, channel.name)];
				viewButton = Strings.VIEW;
				joinButton = inCurrentChannel ? Strings.JOIN_DISABLED : Strings.JOIN;
				Icon = Speaker;
				channelPath = `/channels/${guild.id}/${channel.id}`;
			} else {
				headerText = Strings.HEADER_VOICE;
				text = BdApi.React.createElement("h3", null, channel.name);
				viewButton = Strings.VIEW_CALL;
				joinButton = inCurrentChannel ? Strings.JOIN_DISABLED_CALL : Strings.JOIN_CALL;
				Icon = CallJoin;
				channelPath = `/channels/@me/${channel.id}`;
			}
			switch (channel.type) {
				case 1:
					headerText = Strings.HEADER_PRIVATE;
					break;
				case 3:
					headerText = Strings.HEADER_GROUP;
					text = BdApi.React.createElement("h3", null, channel.name || groupDMName(channel.recipients));
					break;
				case 13:
					headerText = Strings.HEADER_STAGE;
					Icon = Stage;
			}
			const section = BdApi.React.createElement(UserPopoutSection, null, BdApi.React.createElement("h3", {
				className: modules_9dbd3268.header
			}, headerText), !(channel.type === 1) && BdApi.React.createElement("div", {
				className: modules_9dbd3268.body
			}, BdApi.React.createElement(GuildImage, {
				guild,
				channel,
				channelPath
			}), BdApi.React.createElement("div", {
				className: modules_9dbd3268.text
			}, text)), BdApi.React.createElement("div", {
				className: modules_9dbd3268.buttonWrapper
			}, BdApi.React.createElement("button", {
				className: modules_9dbd3268.button,
				disabled: channelSelected,
				onClick: () => {
					if (channelPath)
						transitionTo(channelPath);
				}
			}, viewButton), !isCurrentUser && BdApi.React.createElement(Tooltip, {
				text: joinButton,
				position: "top"
			}, (props2) => BdApi.React.createElement("div", {
				...props2,
				className: inCurrentChannel ? `${modules_9dbd3268.joinWrapper} ${modules_9dbd3268.joinWrapperDisabled}` : modules_9dbd3268.joinWrapper
			}, BdApi.React.createElement("button", {
				className: `${modules_9dbd3268.button} ${modules_9dbd3268.joinButton}`,
				disabled: inCurrentChannel,
				onClick: () => {
					if (channel.id)
						ChannelActions.selectVoiceChannel(channel.id);
				},
				onContextMenu: (e) => {
					if (channel.type === 13)
						return;
					zlibrary.ContextMenu.openContextMenu(
						e,
						zlibrary.ContextMenu.buildMenu([
							{
								label: Strings.JOIN_VIDEO,
								id: "voice-activity-join-with-video",
								action: () => {
									if (channel.id)
										ChannelActions.selectVoiceChannel(channel.id, true);
								}
							}
						])
					);
				}
			}, BdApi.React.createElement(Icon, {
				width: "18",
				height: "18"
			}))))));
			return props.wrapper ? BdApi.React.createElement(props.wrapper, null, section) : section;
		}
	
		// components/SettingsPanel.tsx
		const { getModule: getModule$1 } = betterdiscord.Webpack;
		const SwitchItem = getModule$1((m) => m.toString?.().includes("().dividerDefault"), { searchExports: true });
		const SettingsSwitchItem = (props) => {
			const value = Settings.useSettingsState()[props.setting];
			return BdApi.React.createElement(SwitchItem, {
				children: props.name,
				note: props.note,
				value,
				onChange: (v) => {
					Settings[props.setting] = v;
				}
			});
		};
		function SettingsPanel() {
			const settings = {
				showProfileSection: {
					name: Strings.SETTINGS_PROFILE,
					note: Strings.SETTINGS_PROFILE_NOTE
				},
				showMemberListIcons: {
					name: Strings.SETTINGS_ICONS,
					note: Strings.SETTINGS_ICONS_NOTE
				},
				showDMListIcons: {
					name: Strings.SETTINGS_DM_ICONS,
					note: Strings.SETTINGS_DM_ICONS_NOTE
				},
				showPeopleListIcons: {
					name: Strings.SETTINGS_PEOPLE_ICONS,
					note: Strings.SETTINGS_PEOPLE_ICONS_NOTE
				},
				showGuildIcons: {
					name: Strings.SETTINGS_GUILD_ICONS,
					note: Strings.SETTINGS_GUILD_ICONS_NOTE
				},
				currentChannelColor: {
					name: Strings.SETTINGS_COLOR,
					note: Strings.SETTINGS_COLOR_NOTE
				},
				showStatusIcons: {
					name: Strings.SETTINGS_STATUS,
					note: Strings.SETTINGS_STATUS_NOTE
				},
				ignoreEnabled: {
					name: Strings.SETTINGS_IGNORE,
					note: Strings.SETTINGS_IGNORE_NOTE
				}
			};
			return BdApi.React.createElement(BdApi.React.Fragment, null, Object.keys(settings).map((key) => {
				const { name, note } = settings[key];
				return BdApi.React.createElement(SettingsSwitchItem, {
					setting: key,
					name,
					note
				});
			}));
		}
	
		// index.tsx
		const {
			Filters: { byProps, byStrings },
			getModule
		} = betterdiscord.Webpack;
		const { getModuleWithKey, store } = WebpackUtils;
		const memberItemSelector = `.${getModule(byProps("member", "activity")).member}`;
		const privateChannelSelector = `.${getModule(byProps("channel", "activity")).channel}`;
		const peopleItemSelector = `.${getModule(byProps("peopleListItem")).peopleListItem}`;
		const children = getModule(byProps("avatar", "children")).children;
		class VoiceActivity extends BasePlugin {
			contextMenuUnpatches;
			onStart() {
				this.contextMenuUnpatches = new Set();
				betterdiscord.DOM.addStyle(styles() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`);
				Strings.subscribe();
				this.patchUserPopout();
				this.patchPrivateChannelProfile();
				this.patchGuildIcon();
				this.patchMemberListItem();
				this.patchPrivateChannel();
				this.patchPeopleListItem();
				this.patchChannelContextMenu();
				this.patchGuildContextMenu();
			}
			patchUserPopout() {
				const [UserPopoutBody, key] = getModuleWithKey(byStrings(".showCopiableUsername"));
				betterdiscord.Patcher.after(UserPopoutBody, key, (_, [props], ret) => {
					const popoutSections = betterdiscord.Utils.findInTree(ret, (i) => i.onScroll, {
						walkable: ["props", "children"]
					})?.children;
					const activitySectionIndex = popoutSections.findIndex(
						(section) => section.props.hasOwnProperty("activity")
					);
					popoutSections.splice(activitySectionIndex, 0, BdApi.React.createElement(VoiceProfileSection, {
						userId: props.user.id
					}));
				});
			}
			patchPrivateChannelProfile() {
				const [PrivateChannelProfile, key] = getModuleWithKey((m) => m.Inner);
				const { Inner } = PrivateChannelProfile[key];
				betterdiscord.Patcher.after(PrivateChannelProfile, key, (_, [props], ret) => {
					if (props.profileType !== 3)
						return ret;
					const children2 = ret.props.children;
					ret.props.children = (childrenProps) => {
						const childrenRet = children2(childrenProps);
						const sections = betterdiscord.Utils.findInTree(childrenRet, (i) => Array.isArray(i), {
							walkable: ["props", "children"]
						});
						sections.splice(2, 0, BdApi.React.createElement(VoiceProfileSection, {
							userId: props.user.id,
							wrapper: Inner
						}));
						return childrenRet;
					};
				});
			}
			async patchGuildIcon() {
				const getGuildMediaState = (guildId, ignoredChannels) => {
					const vocalChannelIds = GuildChannelStore.getVocalChannelIds(guildId);
					let audio = false;
					let video = false;
					let screenshare = false;
					for (const id of vocalChannelIds) {
						if (ignoredChannels.includes(id))
							continue;
						const voiceStates = Object.values(VoiceStateStore.getVoiceStatesForChannel(id));
						if (!voiceStates.length)
							continue;
						else
							audio = true;
						if (!video && VoiceStateStore.hasVideo(id))
							video = true;
						if (!screenshare && voiceStates.some((voiceState) => voiceState.selfStream))
							screenshare = true;
						if (audio && video && screenshare)
							break;
					}
					return { audio, video, screenshare };
				};
				const GuildChannelStore = getModule(store("GuildChannelStore"));
				const element = document.querySelector(".wrapper-3XVBev");
				const targetInstance = betterdiscord.Utils.findInTree(
					betterdiscord.ReactUtils.getInternalInstance(element),
					(n) => n?.elementType?.type && n.pendingProps?.mediaState,
					{ walkable: ["return"] }
				);
				betterdiscord.Patcher.before(targetInstance.elementType, "type", (_, [props]) => {
					const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState();
					const mediaState = useStateFromStores(
						[VoiceStateStore],
						() => getGuildMediaState(props.guild.id, ignoredChannels)
					);
					if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
						props.mediaState = { ...props.mediaState, ...mediaState };
					} else if (!props.mediaState.participating) {
						props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
					}
				});
				forceRerender(element);
			}
			async patchMemberListItem() {
				const MemberListItem = await zlibrary.ReactComponents.getComponent(
					"MemberListItem",
					memberItemSelector,
					(c) => c.prototype?.renderPremium
				);
				betterdiscord.Patcher.after(MemberListItem.component.prototype, "render", (thisObject, _, ret) => {
					if (thisObject.props.user) {
						Array.isArray(ret.props.children) ? ret.props.children.unshift(BdApi.React.createElement(VoiceIcon, {
							userId: thisObject.props.user.id,
							context: "memberlist"
						})) : ret.props.children = [BdApi.React.createElement(VoiceIcon, {
							userId: thisObject.props.user.id,
							context: "memberlist"
						})];
					}
				});
				forceUpdateAll(memberItemSelector);
			}
			async patchPrivateChannel() {
				const PrivateChannel = await zlibrary.ReactComponents.getComponent(
					"PrivateChannel",
					privateChannelSelector,
					(c) => c.prototype?.renderSubtitle
				);
				betterdiscord.Patcher.after(PrivateChannel.component.prototype, "render", (thisObject, _, ret) => {
					if (!thisObject.props.user)
						return;
					const props = betterdiscord.Utils.findInTree(ret, (e) => e?.children && e?.id, { walkable: ["children", "props"] });
					const children2 = props.children;
					props.children = (childrenProps) => {
						const childrenRet = children2(childrenProps);
						const privateChannel = betterdiscord.Utils.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
							walkable: ["children", "props"]
						});
						privateChannel.children = [
							privateChannel.children,
							BdApi.React.createElement("div", {
								className: modules_df1df857.iconContainer
							}, BdApi.React.createElement(VoiceIcon, {
								userId: thisObject.props.user.id,
								context: "dmlist"
							}))
						];
						return childrenRet;
					};
				});
				forceUpdateAll(privateChannelSelector);
			}
			async patchPeopleListItem() {
				const PeopleListItem = await zlibrary.ReactComponents.getComponent(
					"PeopleListItem",
					peopleItemSelector,
					(c) => c.prototype?.componentWillEnter
				);
				betterdiscord.Patcher.after(PeopleListItem.component.prototype, "render", (thisObject, _, ret) => {
					if (!thisObject.props.user)
						return;
					const children2 = ret.props.children;
					ret.props.children = (childrenProps) => {
						const childrenRet = children2(childrenProps);
						betterdiscord.Utils.findInTree(childrenRet, (i) => Array.isArray(i), { walkable: ["props", "children"] }).splice(
							1,
							0,
							BdApi.React.createElement("div", {
								className: modules_df1df857.iconContainer
							}, BdApi.React.createElement(VoiceIcon, {
								userId: thisObject.props.user.id,
								context: "peoplelist"
							}))
						);
						return childrenRet;
					};
				});
				forceUpdateAll(peopleItemSelector);
			}
			async patchChannelContextMenu() {
				const unpatch = betterdiscord.ContextMenu.patch("channel-context", (ret, props) => {
					if (!Settings.ignoreEnabled)
						return ret;
					if (props.channel.type !== 2 && props.channel.type !== 13)
						return ret;
					const { ignoredChannels } = Settings.useSettingsState();
					const ignored = ignoredChannels.includes(props.channel.id);
					const menuItem = betterdiscord.ContextMenu.buildItem({
						type: "toggle",
						label: Strings.CONTEXT_IGNORE,
						id: "voiceactivity-ignore",
						checked: ignored,
						action: () => {
							if (ignored) {
								const newIgnoredChannels = ignoredChannels.filter((id) => id !== props.channel.id);
								Settings.ignoredChannels = newIgnoredChannels;
							} else {
								const newIgnoredChannels = [...ignoredChannels, props.channel.id];
								Settings.ignoredChannels = newIgnoredChannels;
							}
						}
					});
					ret.props.children[3].props.children.splice(2, 0, menuItem);
				});
				this.contextMenuUnpatches.add(unpatch);
			}
			async patchGuildContextMenu() {
				const unpatch = betterdiscord.ContextMenu.patch("guild-context", (ret, props) => {
					if (!Settings.ignoreEnabled)
						return ret;
					const { ignoredGuilds } = Settings.useSettingsState();
					const ignored = ignoredGuilds.includes(props.guild.id);
					const menuItem = betterdiscord.ContextMenu.buildItem({
						type: "toggle",
						label: Strings.CONTEXT_IGNORE,
						id: "voiceactivity-ignore",
						checked: ignored,
						action: () => {
							if (ignored) {
								const newIgnoredGuilds = ignoredGuilds.filter((id) => id !== props.guild.id);
								Settings.ignoredGuilds = newIgnoredGuilds;
							} else {
								const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
								Settings.ignoredGuilds = newIgnoredGuilds;
							}
						}
					});
					ret.props.children[2].props.children.push(menuItem);
				});
				this.contextMenuUnpatches.add(unpatch);
			}
			onStop() {
				betterdiscord.DOM.removeStyle();
				betterdiscord.Patcher.unpatchAll();
				Strings.unsubscribe();
				this.contextMenuUnpatches.forEach((unpatch) => unpatch());
				this.contextMenuUnpatches.clear();
				forceUpdateAll(memberItemSelector);
				forceUpdateAll(privateChannelSelector);
				forceUpdateAll(peopleItemSelector);
			}
			getSettingsPanel() {
				return BdApi.React.createElement(SettingsPanel, null);
			}
		}
	
		return VoiceActivity;
	
	})(new BdApi("VoiceActivity"), BdApi.React, Library, BasePlugin);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/