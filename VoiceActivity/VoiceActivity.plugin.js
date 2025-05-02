/**
 * @name VoiceActivity
 * @author Neodymium
 * @version 1.11.1
 * @description Shows icons and info in popouts, the member list, and more when someone is in a voice channel.
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

'use strict';

const betterdiscord = new BdApi("VoiceActivity");
const react = BdApi.React;

// styles
let _styles = "";
function _loadStyle(path, css) {
	_styles += "/*" + path + "*/\n" + css + "\n";
}
function styles() {
	return _styles;
}

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
function getIcon(searchString) {
	const filter = (m) => betterdiscord.Webpack.Filters.byStrings(searchString, '"svg"')(m) && typeof m === "function";
	return betterdiscord.Webpack.getModule(filter, {
		searchExports: true
	});
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
function expectWithKey(options) {
	const [module, key] = betterdiscord.Webpack.getWithKey(options.filter, options);
	if (module) return [module, key];
	const fallback = expect(module, options);
	if (fallback) {
		const key2 = "__key";
		return [{ [key2]: fallback }, key2];
	}
	return void 0;
}
function expectSelectors(name, classes) {
	return expect(getSelectors(...classes), {
		name
	});
}
function expectIcon(name, searchString) {
	return expect(getIcon(searchString), {
		name,
		fallback: (_props) => null
	});
}
function byType(type) {
	return (e) => typeof e === type;
}

// manifest.json
const changelog = [
	{
		title: "Fixed",
		type: "fixed",
		items: [
			"Fixed patching activity card header."
		]
	}
];

// @lib/utils/react.tsx
const EmptyComponent = (props) => null;

// @discord/stores.ts
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const VoiceStateStore = betterdiscord.Webpack.getStore("VoiceStateStore");
const GuildStore = betterdiscord.Webpack.getStore("GuildStore");
const ChannelStore = betterdiscord.Webpack.getStore("ChannelStore");
const PermissionStore = betterdiscord.Webpack.getStore("PermissionStore");
const useStateFromStores = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("useStateFromStores"),
	name: "Flux",
	fallback(stores, callback) {
		return callback();
	},
	searchExports: true
});

// modules/discordmodules.tsx
function useUserVoiceStateFallback({ userId }) {
	const voiceState = useStateFromStores(
		[VoiceStateStore],
		() => userId && VoiceStateStore.getDiscoverableVoiceStateForUser(userId)
	);
	const channel = useStateFromStores([ChannelStore], () => {
		if (voiceState?.channelId) return ChannelStore.getChannel(voiceState?.channelId);
	});
	const visible = useStateFromStores(
		[PermissionStore],
		() => channel?.isPrivate() || PermissionStore.can(Permissions.VIEW_CHANNEL, channel)
	);
	if (visible) {
		return {
			voiceState,
			voiceChannel: channel
		};
	} else return {};
}
const MemberListItem = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("memberInner", "renderPopout"),
	name: "MemberListItem"
});
const UserPanelBody = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("SIDEBAR", "nicknameIcons"),
	name: "UserPanelBody"
});
const UserPopoutBody = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("usernameIcon", "hasAvatarForGuild"),
	name: "UserPopoutBody"
});
const PrivateChannel = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("PrivateChannel", "getTypingUsers"),
	name: "PrivateChannel",
	defaultExport: false
});
const PeopleListItem = expectModule({
	filter: (m) => m?.prototype?.render && betterdiscord.Webpack.Filters.byStrings("this.peopleListItemRef")(m),
	name: "PeopleListItem"
});
const VoiceActivityCard = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("UserProfileVoiceActivityCard"),
	name: "VoiceActivityCard",
	fallback: EmptyComponent
});
const VoiceActivityCardText = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("TEXT_NORMAL", "OPEN_VOICE_CHANNEL"),
	name: "VoiceActivityCardText"
});
const UserPopoutActivity = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("UserProfileFeaturedActivity"),
	name: "UserPopoutActivity"
});
const Permissions = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "Permissions",
	fallback: {
		VIEW_CHANNEL: 1024n
	}
});
const memberSelectors = expectSelectors("Children Class", ["avatar", "children", "layout"]);
const useUserVoiceState = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("getDiscoverableVoiceState", "getDiscoverableVoiceStateForUser"),
	name: "useUserVoiceState",
	fallback: useUserVoiceStateFallback
});

// locales.json
const el = {
	SETTINGS_PROFILE: "Τομέας Προφίλ",
	SETTINGS_PROFILE_NOTE: "Εμφανίζει τον τομέα προφίλ για την τρέχουσα δραστηριότητα φωνής στα αναδυόμενα χρήστη και στην πλευρικές μπάρες προφίλ των Άμεσων Μηνυμάτων.",
	SETTINGS_ICONS: "Εικονίδια Λίστας Μελών",
	SETTINGS_ICONS_NOTE: "Εμφανίζει εικονίδια στη λίστα μελών όταν κάποιος είναι σε κανάλι φωνής.",
	SETTINGS_DM_ICONS: "Εικονίδια Άμεσων Μηνυμάτων",
	SETTINGS_DM_ICONS_NOTE: "Εμφανίζει εικονίδια στη λίστα Άμεσων Μηνυμάτων όταν κάποιος είναι σε κανάλι φωνής.",
	SETTINGS_PEOPLE_ICONS: "Εικονίδια Λίστας Φίλων",
	SETTINGS_PEOPLE_ICONS_NOTE: "Εμφανίζει εικονίδια στη λίστα φίλων όταν κάποιος είναι σε κανάλι φωνής.",
	SETTINGS_GUILD_ICONS: "Εικονίδια Συντεχνίας",
	SETTINGS_GUILD_ICONS_NOTE: "Εμφανίζει εικονίδια στις συντεχνίες ακόμα και αν δεν συμμετέχετε.",
	SETTINGS_COLOR: "Λίστα Μελών - Χρώμα Εικονιδίου Τρέχοντος Καναλιού",
	SETTINGS_COLOR_NOTE: "Αλλάζει τα εικονίδια της Λίστας Μελών σε πράσινα όταν ο χρήστης είναι στο δικό σας τρέχον κανάλι φωνής.",
	SETTINGS_STATUS: "Λίστα Μελών - Εμφάνιση Εικονιδίων Κατάστασης",
	SETTINGS_STATUS_NOTE: "Αλλάζει τα εικονίδια της Λίστας Μελών όταν ο χρήστης είναι σε Σίγαση, Κώφωση ή έχε ενεργοποιημένο Βίντεο.",
	SETTINGS_IGNORE: "Αγνόηση",
	SETTINGS_IGNORE_NOTE: "Προσθέτει μια επιλογή στο Κανάλι Φωνής και στα μενού περιεχομένου Συντεχνίας για αγνόηση αυτού του καναλιού/συντεχνίας στα Εικονίδια Λϊστας Μελών και στα Αναδυόμενα Χρήστη.",
	CONTEXT_IGNORE: "Αγνόηση στη Δραστηριότητα Φωνής",
	VOICE_CALL: "Φωνητική Κλήση",
	PRIVATE_CALL: "Ιδιωτική Κλήση",
	GROUP_CALL: "Ομαδική Κλήση",
	LIVE: "Ζωντανά",
	HEADER: "Σε ένα Κανάλι Φωνής",
	HEADER_VOICE: "Σε μια Κλήση Φωνής",
	HEADER_PRIVATE: "Σε μια Ιδιωτική Κλήση",
	HEADER_GROUP: "Σε μια Ομαδική Κλήση",
	HEADER_STAGE: "Σε ένα Κανάλι Σταδίου",
	VIEW: "Προβολή Καναλιού",
	VIEW_CALL: "Προβολή Κλήσης",
	JOIN: "Συμμετοχή σε Κανάλι",
	JOIN_CALL: "Συμμετοχή σε Κλήση",
	JOIN_DISABLED: "Ήδη σε Κανάλι",
	JOIN_DISABLED_CALL: "Ήδη σε Κλήση",
	JOIN_VIDEO: "Συμμετοχή με Βίντεο"
};
const ru = {
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
const de = {
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
const fr = {
	SETTINGS_PROFILE: "Section de profil",
	SETTINGS_PROFILE_NOTE: "Affiche une section de profile pour l'activité vocale actuelle dans les popouts utilisateur et les profiles latéraux de MP.",
	SETTINGS_ICONS: "Icônes de la liste de membre",
	SETTINGS_ICONS_NOTE: "Affiche des icônes dans la liste de membre quand quelqu'un est dans un salon vocal.",
	SETTINGS_DM_ICONS: "Icônes de MP",
	SETTINGS_DM_ICONS_NOTE: "Affiche des icônes dans la liste de MP quand quelqu'un est dans un salon vocal.",
	SETTINGS_PEOPLE_ICONS: "Icônes de la liste d'amis",
	SETTINGS_PEOPLE_ICONS_NOTE: "Affiche des icônes dans la liste d'amis quand quelqu'un est dans un salon vocal.",
	SETTINGS_GUILD_ICONS: "Icônes de serveur",
	SETTINGS_GUILD_ICONS_NOTE: "Affiche des icônes de vocal sur les serveurs même quand vous ne participez pas.",
	SETTINGS_COLOR: "Liste de membre - Couleur d'icône du salon actuel",
	SETTINGS_COLOR_NOTE: "Rends les icônes de la liste de membre vertes quand un utilisateur est dans le salon vocal actuel.",
	SETTINGS_STATUS: "Liste de membre - Afficher les icônes de status",
	SETTINGS_STATUS_NOTE: "Change les icônes de la liste de membre quand un utilisateur est muet, mis en sourdine, ou a la vidéo activée.",
	SETTINGS_IGNORE: "Ignorer",
	SETTINGS_IGNORE_NOTE: "Ajoute une option dans les menus contextuels des salons vocaux et serveurs pour ignorer le dit salon/serveur dans les icônes de liste de membre et popouts utilisateur.",
	CONTEXT_IGNORE: "Ignorer dans Activité Vocale",
	VOICE_CALL: "Appel vocal",
	PRIVATE_CALL: "Appel privé",
	GROUP_CALL: "Appel de groupe",
	LIVE: "Live",
	HEADER: "Dans un salon vocal",
	HEADER_VOICE: "Dans un appel vocal",
	HEADER_PRIVATE: "Dans un appel privé",
	HEADER_GROUP: "Dans un appel de groupe",
	HEADER_STAGE: "Dans un salon de conférence",
	VIEW: "Voir le salon",
	VIEW_CALL: "Voir l'appel",
	JOIN: "Rejoindre le salon",
	JOIN_CALL: "Rejoindre l'appel",
	JOIN_DISABLED: "Déjà dans le salon",
	JOIN_DISABLED_CALL: "Déjà en appel",
	JOIN_VIDEO: "Rejoidre avec vidéo",
	MEMBER: "Membre",
	MEMBERS: "Membres"
};
const locales = {
	"en-US": {
	SETTINGS_PROFILE: "Profile Section",
	SETTINGS_PROFILE_NOTE: "Shows profile section for current voice activity in user popouts and DM profile sidebars.",
	SETTINGS_ICONS: "Member List Icons",
	SETTINGS_ICONS_NOTE: "Shows icons on the member list when someone is in a voice channel.",
	SETTINGS_DM_ICONS: "DM Icons",
	SETTINGS_DM_ICONS_NOTE: "Shows icons on the DM list when someone is in a voice channel.",
	SETTINGS_PEOPLE_ICONS: "Friends List Icons",
	SETTINGS_PEOPLE_ICONS_NOTE: "Shows icons on the friends list when someone is in a voice channel.",
	SETTINGS_GUILD_ICONS: "Server Icons",
	SETTINGS_GUILD_ICONS_NOTE: "Shows voice icons on servers even when you're not participating.",
	SETTINGS_COLOR: "Member List - Current Channel Icon Color",
	SETTINGS_COLOR_NOTE: "Makes the Member List icons green when the user is in your current voice channel.",
	SETTINGS_STATUS: "Member List - Show Status Icons",
	SETTINGS_STATUS_NOTE: "Changes the Member List icons when a user is Muted, Deafened, or has Video enabled.",
	SETTINGS_CURRENT_USER: "Current User Icon",
	SETTINGS_CURRENT_USER_NOTE: "Toggles displaying a voice channel icon for the current user.",
	SETTINGS_IGNORE: "Ignore",
	SETTINGS_IGNORE_NOTE: "Adds an option on Voice Channel and Server context menus to ignore that channel/server in Member List Icons and User Popouts.",
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
	JOIN_VIDEO: "Join With Video",
	MEMBER: "Member",
	MEMBERS: "Members"
},
	el: el,
	ru: ru,
	de: de,
	fr: fr
};

// modules/utils.ts
const Settings = new SettingsManager({
	showProfileSection: true,
	showMemberListIcons: true,
	showDMListIcons: true,
	showPeopleListIcons: true,
	currentChannelColor: true,
	showStatusIcons: true,
	currentUserIcon: true,
	ignoreEnabled: false,
	ignoredChannels: [],
	ignoredGuilds: []
});
const Strings = new StringsManager(locales, "en-US");
function groupDMName(members) {
	if (members.length === 1) {
		return UserStore.getUser(members[0]).globalName;
	} else if (members.length > 1) {
		let name = "";
		for (let i = 0; i < members.length; i++) {
			if (i === members.length - 1) name += UserStore.getUser(members[i]).globalName;
			else name += UserStore.getUser(members[i]).globalName + ", ";
		}
		return name;
	}
	return "Unnamed";
}

// styles/voiceicon.module.css
const css = `
.VoiceActivity-voiceicon-icon {
	height: 20px;
	width: 20px;
	min-width: 20px;
	border-radius: 50%;
	background-color: var(--background-accent);
	cursor: pointer;
	svg {
		padding: 3px;
		color: #fff;
	}
}
.VoiceActivity-voiceicon-iconCurrentCall {
	background-color: var(--status-positive);
}
.VoiceActivity-voiceicon-iconLive {
	height: 16px;
	border-radius: 16px;
	background-color: var(--red-400);
	color: #fff;
	font-size: 12px;
	line-height: 16px;
	font-weight: 600;
	font-family: var(--font-display);
	text-transform: uppercase;
	& > div {
		padding: 0 6px;
	}
}
.VoiceActivity-voiceicon-tooltip {
	.VoiceActivity-voiceicon-header {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.VoiceActivity-voiceicon-subtext {
		display: flex;
		flex-direction: row;
		margin-top: 3px;
		& > div {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
	.VoiceActivity-voiceicon-tooltipIcon {
		min-width: 16px;
		margin-right: 3px;
		color: var(--interactive-normal);
	}
}
.VoiceActivity-voiceicon-iconContainer {
	margin-left: auto;
}`;
_loadStyle("voiceicon.module.css", css);
const modules_1af761ba = {
	"icon": "VoiceActivity-voiceicon-icon",
	"iconCurrentCall": "VoiceActivity-voiceicon-iconCurrentCall",
	"iconLive": "VoiceActivity-voiceicon-iconLive",
	"tooltip": "VoiceActivity-voiceicon-tooltip",
	"header": "VoiceActivity-voiceicon-header",
	"subtext": "VoiceActivity-voiceicon-subtext",
	"tooltipIcon": "VoiceActivity-voiceicon-tooltipIcon",
	"iconContainer": "VoiceActivity-voiceicon-iconContainer"
};
const iconStyles = modules_1af761ba;

// @discord/icons.tsx
const Speaker = expectIcon("Speaker", "M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1");
const Muted = expectIcon(
	"Muted",
	"m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.21-.1.58.2.62V20H9a1"
);
const ServerMuted = expectIcon(
	"ServerMuted",
	"M21.76.83a5.02 5.02 0 0 1 .78 7.7 5 5 0 0 1-7.07 0 5.02 5.02 0 0 1 0-7.07"
);
const Deafened = expectIcon(
	"Deafened",
	"M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4l20-20ZM17.06"
);
const ServerDeafened = expectIcon(
	"ServerDeafened",
	"M12.38 1c.38.02.58.45.4.78-.15.3-.3.62-.4.95A.4.4 0 0 1 12 3a9 9 0 0 0-8.95 10h1.87a5"
);
const Video = expectIcon("Video", "M4 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h11a3 3");
const ChannelIcon = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("isGuildStageVoice", "isNSFW"),
	name: "ChannelIcon",
	fallback: (_props) => null
});

// @discord/modules.ts
const transitionTo = expectModule({
	filter: betterdiscord.Webpack.Filters.combine(
		betterdiscord.Webpack.Filters.byStrings("transitionTo -"),
		byType("function")
	),
	searchExports: true,
	name: "transitionTo"
});

// components/VoiceIcon.tsx
function VoiceIcon(props) {
	const settingsState = Settings.useSettingsState(
		"showMemberListIcons",
		"showDMListIcons",
		"showPeopleListIcons",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds",
		"currentChannelColor",
		"showStatusIcons",
		"currentUserIcon"
	);
	const currentUser = UserStore.getCurrentUser();
	const { voiceState, voiceChannel: channel } = useUserVoiceState({ userId: props.userId });
	const { voiceState: currentUserVoiceState } = useUserVoiceState({ userId: currentUser?.id });
	if (props.context === "memberlist" && !settingsState.showMemberListIcons) return null;
	if (props.context === "dmlist" && !settingsState.showDMListIcons) return null;
	if (props.context === "peoplelist" && !settingsState.showPeopleListIcons) return null;
	if (props.userId === currentUser?.id && !settingsState.currentUserIcon) return null;
	if (!voiceState) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	const ignored = settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;
	let text;
	let subtext;
	let channelPath;
	let className = iconStyles.icon;
	if (settingsState.currentChannelColor && channel.id === currentUserVoiceState?.channelId)
		className = `${iconStyles.icon} ${iconStyles.iconCurrentCall}`;
	if (voiceState.selfStream) className = iconStyles.iconLive;
	if (guild) {
		text = guild.name;
		subtext = channel.name;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.get("VOICE_CALL");
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			text = UserStore.getUser(channel.recipients[0]).globalName;
			subtext = Strings.get("PRIVATE_CALL");
			break;
		case 3:
			text = channel.name || groupDMName(channel.recipients);
			subtext = Strings.get("GROUP_CALL");
			break;
	}
	let Icon = Speaker;
	if (settingsState.showStatusIcons) {
		if (voiceState.selfVideo) Icon = Video;
		else if (voiceState.deaf) Icon = ServerDeafened;
		else if (voiceState.selfDeaf) Icon = Deafened;
		else if (voiceState.mute) Icon = ServerMuted;
		else if (voiceState.selfMute) Icon = Muted;
	}
	return BdApi.React.createElement(
		"div",
		{
			className,
			onClick: (e) => {
				e.stopPropagation();
				e.preventDefault();
				if (channelPath) transitionTo?.(channelPath);
			}
		},
		BdApi.React.createElement(
			betterdiscord.Components.Tooltip,
			{
				text: BdApi.React.createElement("div", { className: iconStyles.tooltip }, BdApi.React.createElement("div", { className: iconStyles.header, style: { fontWeight: "600" } }, text), BdApi.React.createElement("div", { className: iconStyles.subtext }, BdApi.React.createElement(
					ChannelIcon,
					{
						className: iconStyles.tooltipIcon,
						size: "16",
						width: "16",
						height: "16",
						color: "currentColor",
						channel
					}
				), BdApi.React.createElement("div", { style: { fontWeight: "400" } }, subtext)))
			},
			(props2) => BdApi.React.createElement("div", { ...props2 }, !voiceState.selfStream ? BdApi.React.createElement(Icon, { size: "14", width: "14", height: "14", color: "currentColor" }) : Strings.get("LIVE"))
		)
	);
}

// components/VoiceProfileSection.tsx
function VoiceProfileSection(props) {
	const settingsState = Settings.useSettingsState(
		"showProfileSection",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds"
	);
	const { voiceState, voiceChannel: channel } = useUserVoiceState({ userId: props.user.id });
	if (!settingsState.showProfileSection) return null;
	if (!voiceState) return null;
	const ignored = settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(channel.guild_id);
	if (settingsState.ignoreEnabled && ignored) return null;
	return BdApi.React.createElement(
		VoiceActivityCard,
		{
			currentUser: UserStore.getCurrentUser(),
			user: props.user,
			voiceChannel: channel,
			onClose: props.onClose
		}
	);
}

// index.tsx
class VoiceActivity {
	meta;
	contextMenuUnpatches = new Set();
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(
			styles() + `${memberSelectors?.children}:empty { margin-left: 0; } ${memberSelectors?.children} { display: flex; gap: 8px; } ${memberSelectors?.layout} { width: 100%; }`
		);
		Strings.subscribe();
		this.patchPeopleListItem();
		this.patchMemberListItem();
		this.patchUserPanel();
		this.patchUserPopout();
		this.patchVoiceActivityCard();
		this.patchUserPopoutActivity();
		this.patchPrivateChannel();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
		betterdiscord.Patcher.instead(VoiceStateStore, "getDiscoverableVoiceState", (_, [guildId, userId]) => {
			return VoiceStateStore.getDiscoverableVoiceStateForUser(userId);
		});
	}
	patchUserPanel() {
		if (!UserPanelBody) return;
		const [module, key] = UserPanelBody;
		betterdiscord.Patcher.after(module, key, (_, [props], ret) => {
			ret.props.children.splice(1, 0, BdApi.React.createElement(VoiceProfileSection, { user: props.user }));
		});
	}
	patchUserPopout() {
		if (!UserPopoutBody) return;
		betterdiscord.Patcher.after(...UserPopoutBody, (_, [props], ret) => {
			ret.props.children.splice(7, 0, BdApi.React.createElement(VoiceProfileSection, { user: props.user, onClose: props.onClose }));
		});
	}
	patchVoiceActivityCard() {
		const filter = (e) => Array.isArray(e) && e[0].props.size && e[1].props.onClick;
		if (!VoiceActivityCardText) return;
		betterdiscord.Patcher.after(...VoiceActivityCardText, (_, [props], ret) => {
			const channelPath = props.channel.guild_id ? `/channels/${props.channel.guild_id}/${props.channel.id}` : `/channels/@me/${props.channel.id}`;
			const channelText = betterdiscord.Utils.findInTree(ret, filter, {
				walkable: ["props", "children"]
			})[1];
			channelText.props.onClick = (e) => {
				e.stopPropagation();
				props.onClose?.();
				if (channelPath) transitionTo?.(channelPath);
			};
		});
	}
	patchUserPopoutActivity() {
		if (!UserPopoutActivity) return;
		betterdiscord.Patcher.after(...UserPopoutActivity, (_, [props], ret) => {
			const { showProfileSection } = Settings.useSettingsState("showProfileSection");
			if (showProfileSection && ret?.props?.voiceChannel) return null;
		});
	}
	patchMemberListItem() {
		if (!MemberListItem) return;
		betterdiscord.Patcher.after(...MemberListItem, (_, [props], ret) => {
			if (!props.user) return ret;
			const children = ret.props.children;
			ret.props.children = (childrenProps) => {
				const childrenRet = children(childrenProps);
				const target = betterdiscord.Utils.findInTree(childrenRet, (x) => x.props?.avatar && x.props?.decorators, {
					walkable: ["props", "children"]
				});
				const icon = BdApi.React.createElement(VoiceIcon, { userId: props.user.id, context: "memberlist" });
				Array.isArray(target.props.children) ? target.props.children.unshift(icon) : target.props.children = [icon];
				return childrenRet;
			};
		});
	}
	patchPrivateChannel() {
		if (!PrivateChannel) return;
		const patchType = (props, ret) => {
			if (props.channel.type !== 1) return;
			const target = betterdiscord.Utils.findInTree(ret, (e) => typeof e?.props?.children !== "function", {
				walkable: ["children", "props"]
			})?.props?.children ?? ret;
			const children = target.props.children;
			target.props.children = (childrenProps) => {
				const childrenRet = children(childrenProps);
				const privateChannel = betterdiscord.Utils.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
					walkable: ["children", "props"]
				});
				privateChannel.children = [
					privateChannel.children,
					BdApi.React.createElement("div", { className: iconStyles.iconContainer }, BdApi.React.createElement(VoiceIcon, { userId: props.user.id, context: "dmlist" }))
				];
				return childrenRet;
			};
		};
		let patchedType;
		betterdiscord.Patcher.after(...PrivateChannel, (_, __, containerRet) => {
			let target = containerRet.children || containerRet;
			if (patchedType) {
				target.type = patchedType;
				return containerRet;
			}
			const original = target.type;
			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};
			target.type = patchedType;
		});
	}
	patchPeopleListItem() {
		if (!PeopleListItem) return;
		betterdiscord.Patcher.after(PeopleListItem.prototype, "render", (that, _, ret) => {
			if (!that.props.user) return;
			const children = ret.props.children;
			ret.props.children = (childrenProps) => {
				const childrenRet = children(childrenProps);
				betterdiscord.Utils.findInTree(childrenRet, (i) => Array.isArray(i), { walkable: ["props", "children"] }).splice(
					1,
					0,
					BdApi.React.createElement("div", { className: iconStyles.iconContainer }, BdApi.React.createElement(VoiceIcon, { userId: that.props.user.id, context: "peoplelist" }))
				);
				return childrenRet;
			};
		});
	}
	patchChannelContextMenu() {
		const unpatch = betterdiscord.ContextMenu.patch("channel-context", (ret, props) => {
			if (!Settings.get("ignoreEnabled")) return ret;
			if (props.channel.type !== 2 && props.channel.type !== 13) return ret;
			const { ignoredChannels } = Settings.useSettingsState("ignoredChannels");
			const ignored = ignoredChannels.includes(props.channel.id);
			const menuItem = betterdiscord.ContextMenu.buildItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredChannels = ignoredChannels.filter((id) => id !== props.channel.id);
						Settings.set("ignoredChannels", newIgnoredChannels);
					} else {
						const newIgnoredChannels = [...ignoredChannels, props.channel.id];
						Settings.set("ignoredChannels", newIgnoredChannels);
					}
				}
			});
			ret.props.children[3].props.children.splice(4, 0, menuItem);
		});
		this.contextMenuUnpatches.add(unpatch);
	}
	patchGuildContextMenu() {
		const unpatch = betterdiscord.ContextMenu.patch("guild-context", (ret, props) => {
			if (!props.guild) return ret;
			if (!Settings.get("ignoreEnabled")) return ret;
			const { ignoredGuilds } = Settings.useSettingsState("ignoredGuilds");
			const ignored = ignoredGuilds.includes(props.guild.id);
			const menuItem = betterdiscord.ContextMenu.buildItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredGuilds = ignoredGuilds.filter((id) => id !== props.guild.id);
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					} else {
						const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					}
				}
			});
			ret.props.children[2].props.children.push(menuItem);
		});
		this.contextMenuUnpatches.add(unpatch);
	}
	stop() {
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
		this.contextMenuUnpatches.forEach((unpatch) => unpatch());
		this.contextMenuUnpatches.clear();
		Strings.unsubscribe();
	}
	getSettingsPanel() {
		return buildSettingsPanel(Settings, [
			{
				id: "showProfileSection",
				type: "switch",
				name: Strings.get("SETTINGS_PROFILE"),
				note: Strings.get("SETTINGS_PROFILE_NOTE")
			},
			{
				id: "showMemberListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_ICONS"),
				note: Strings.get("SETTINGS_ICONS_NOTE")
			},
			{
				id: "showDMListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_DM_ICONS"),
				note: Strings.get("SETTINGS_DM_ICONS_NOTE")
			},
			{
				id: "showPeopleListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_PEOPLE_ICONS"),
				note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE")
			},
			{
				id: "currentChannelColor",
				type: "switch",
				name: Strings.get("SETTINGS_COLOR"),
				note: Strings.get("SETTINGS_COLOR_NOTE")
			},
			{
				id: "showStatusIcons",
				type: "switch",
				name: Strings.get("SETTINGS_STATUS"),
				note: Strings.get("SETTINGS_STATUS_NOTE")
			},
			{
				id: "currentUserIcon",
				type: "switch",
				name: Strings.get("SETTINGS_CURRENT_USER"),
				note: Strings.get("SETTINGS_CURRENT_USER_NOTE")
			},
			{
				id: "ignoreEnabled",
				type: "switch",
				name: Strings.get("SETTINGS_IGNORE"),
				note: Strings.get("SETTINGS_IGNORE_NOTE")
			}
		]);
	}
}

module.exports = VoiceActivity;

/*@end@*/