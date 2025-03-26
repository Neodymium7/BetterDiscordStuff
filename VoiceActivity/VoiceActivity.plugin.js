/**
 * @name VoiceActivity
 * @author Neodymium
 * @version 1.9.10
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
function styles$2() {
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
			"Updated styling for new UI refresh."
		]
	}
];

// @lib/utils/react.tsx
const EmptyComponent = (props) => null;

// modules/discordmodules.tsx
const MemberListItem = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("memberInner", "renderPopout"),
	name: "MemberListItem"
});
const UserPanelBody = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("PANEL", "getUserProfile"),
	name: "UserPanelBody"
});
const UserPopoutBody = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("BITE_SIZE", "UserProfilePopoutBody"),
	name: "UserPopoutBody"
});
const PrivateChannel = expectWithKey({
	filter: betterdiscord.Webpack.Filters.byStrings("PrivateChannel", "getTypingUsers"),
	name: "PrivateChannel",
	defaultExport: false
});
const GuildIcon = expectModule({
	filter: (m) => m?.type && betterdiscord.Webpack.Filters.byStrings("GuildItem", "mediaState")(m.type),
	name: "GuildIcon"
});
const PeopleListItem = expectModule({
	filter: (m) => m?.prototype?.render && betterdiscord.Webpack.Filters.byStrings("this.peopleListItemRef")(m),
	name: "PeopleListItem"
});
const PartyMembers = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("overflowCountClassName"),
	name: "PartyMembers",
	fallback: EmptyComponent
});
const MoreIcon = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings(".contextMenu", "colors.INTERACTIVE_NORMAL"),
	name: "MoreIcon",
	fallback: EmptyComponent
});
const Permissions = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "Permissions",
	fallback: {
		VIEW_CHANNEL: 1024n
	}
});
const getAcronym = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings(`.replace(/'s /g," ").replace(/\\w+/g,`),
	searchExports: true,
	name: "getAcronym",
	fallback: (name) => name
});
const iconWrapperSelector = expectSelectors("Icon Wrapper Class", ["wrapper", "folderEndWrapper"])?.wrapper;
const memberSelectors = expectSelectors("Children Class", ["avatar", "children", "layout"]);

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

// @discord/stores.ts
const UserStore = betterdiscord.Webpack.getStore("UserStore");
const GuildChannelStore = betterdiscord.Webpack.getStore("GuildChannelStore");
const VoiceStateStore = betterdiscord.Webpack.getStore("VoiceStateStore");
const GuildStore = betterdiscord.Webpack.getStore("GuildStore");
const ChannelStore = betterdiscord.Webpack.getStore("ChannelStore");
const SelectedChannelStore = betterdiscord.Webpack.getStore("SelectedChannelStore");
const PermissionStore = betterdiscord.Webpack.getStore("PermissionStore");
const useStateFromStores = expectModule({
	filter: betterdiscord.Webpack.Filters.byStrings("useStateFromStores"),
	name: "Flux",
	fallback(stores, callback) {
		return callback();
	},
	searchExports: true
});

// modules/utils.ts
const Settings = new SettingsManager({
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
const Strings = new StringsManager(locales, "en-US");
const canViewChannel = (channel) => {
	return PermissionStore.can(Permissions.VIEW_CHANNEL, channel);
};
const getGuildMediaState = (guildId, ignoredChannels) => {
	const vocalChannelIds = GuildChannelStore.getVocalChannelIds(guildId);
	let audio = false;
	let video = false;
	let screenshare = false;
	for (const id of vocalChannelIds) {
		if (ignoredChannels.includes(id)) continue;
		const voiceStates = Object.values(VoiceStateStore.getVoiceStatesForChannel(id));
		if (!voiceStates.length) continue;
		if (ChannelStore.getChannel(id).type !== 13) audio = true;
		if (!video && VoiceStateStore.hasVideo(id)) video = true;
		if (!screenshare && voiceStates.some((voiceState) => voiceState.selfStream)) screenshare = true;
		if (audio && video && screenshare) break;
	}
	return { audio, video, screenshare };
};
function groupDMName(members) {
	if (members.length === 1) {
		return UserStore.getUser(members[0]).username;
	} else if (members.length > 1) {
		let name = "";
		for (let i = 0; i < members.length; i++) {
			if (i === members.length - 1) name += UserStore.getUser(members[i]).username;
			else name += UserStore.getUser(members[i]).username + ", ";
		}
		return name;
	}
	return "Unnamed";
}
function forceRerender(element) {
	if (!element) return betterdiscord.Logger.error("Force rerender failed: target element not found");
	const ownerInstance = betterdiscord.ReactUtils.getOwnerInstance(element);
	if (!ownerInstance) return betterdiscord.Logger.error("Force rerender failed: ownerInstance component not found");
	const cancel = betterdiscord.Patcher.instead(ownerInstance, "render", () => {
		cancel();
		return null;
	});
	ownerInstance.forceUpdate(() => ownerInstance.forceUpdate());
}
function useUserVoiceState(userId) {
	return useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(userId));
}

// styles/voiceicon.module.scss
const css$2 = `
.VoiceActivity-voiceicon-icon {
	height: 20px;
	width: 20px;
	min-width: 20px;
	border-radius: 50%;
	background-color: var(--background-floating);
	cursor: pointer;
}
.VoiceActivity-voiceicon-icon:hover {
	background-color: var(--background-tertiary);
}
.VoiceActivity-voiceicon-icon svg {
	padding: 3px;
	color: var(--interactive-normal);
}
.VoiceActivity-voiceicon-iconCurrentCall {
	background-color: var(--status-positive);
}
.VoiceActivity-voiceicon-iconCurrentCall:hover {
	background-color: var(--button-positive-background);
}
.VoiceActivity-voiceicon-iconCurrentCall svg {
	color: #fff;
}
.VoiceActivity-voiceicon-iconLive {
	height: 16px;
	border-radius: 16px;
	background-color: var(--status-danger);
	color: #fff;
	font-size: 12px;
	line-height: 16px;
	font-weight: 600;
	font-family: var(--font-display);
	text-transform: uppercase;
}
.VoiceActivity-voiceicon-iconLive:hover {
	background-color: var(--button-danger-background);
}
.VoiceActivity-voiceicon-iconLive > div {
	padding: 0 6px;
}
.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-header {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext {
	display: flex;
	flex-direction: row;
	margin-top: 3px;
}
.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-subtext > div {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.VoiceActivity-voiceicon-tooltip .VoiceActivity-voiceicon-tooltipIcon {
	min-width: 16px;
	margin-right: 3px;
	color: var(--interactive-normal);
}
.VoiceActivity-voiceicon-iconContainer {
	margin-left: auto;
}
.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-icon {
	margin-inline: 8px;
}
.VoiceActivity-voiceicon-iconContainer .VoiceActivity-voiceicon-iconLive {
	margin-inline: 8px;
}`;
_loadStyle("voiceicon.module.scss", css$2);
const modules_df1df857 = {
	"icon": "VoiceActivity-voiceicon-icon",
	"iconCurrentCall": "VoiceActivity-voiceicon-iconCurrentCall",
	"iconLive": "VoiceActivity-voiceicon-iconLive",
	"tooltip": "VoiceActivity-voiceicon-tooltip",
	"header": "VoiceActivity-voiceicon-header",
	"subtext": "VoiceActivity-voiceicon-subtext",
	"tooltipIcon": "VoiceActivity-voiceicon-tooltipIcon",
	"iconContainer": "VoiceActivity-voiceicon-iconContainer"
};
const iconStyles = modules_df1df857;

// @discord/icons.tsx
const CallJoin = expectIcon(
	"CallJoin",
	"M2 7.4A5.4 5.4 0 0 1 7.4 2c.36 0 .7.22.83.55l1.93 4.64a1 1"
);
const People = expectIcon(
	"People",
	"M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 "
);
const Speaker = expectIcon("Speaker", "M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1");
const Muted = expectIcon("Muted", "m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4");
const Deafened = expectIcon(
	"Deafened",
	"M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4l20-20ZM17.06"
);
const Video = expectIcon("Video", "M4 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h11a3 3");
const Stage = expectIcon("Stage", "M19.61 18.25a1.08 1.08 0 0 1-.07-1.33 9 9 0 1 0-15.07");

// @discord/modules.ts
const transitionTo = expectModule({
	filter: betterdiscord.Webpack.Filters.combine(
		betterdiscord.Webpack.Filters.byStrings("transitionTo -"),
		byType("function")
	),
	searchExports: true,
	name: "transitionTo"
});
const GuildActions = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("requestMembers", "transitionToGuildSync"),
	name: "GuildActions"
});
const ChannelActions = expectModule({
	filter: betterdiscord.Webpack.Filters.byKeys("selectChannel", "selectVoiceChannel"),
	name: "ChannelActions"
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
		"showStatusIcons"
	);
	const voiceState = useUserVoiceState(props.userId);
	const currentUserVoiceState = useUserVoiceState(UserStore.getCurrentUser()?.id);
	if (props.context === "memberlist" && !settingsState.showMemberListIcons) return null;
	if (props.context === "dmlist" && !settingsState.showDMListIcons) return null;
	if (props.context === "peoplelist" && !settingsState.showPeopleListIcons) return null;
	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !canViewChannel(channel)) return null;
	const ignored = settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;
	let text;
	let subtext;
	let TooltipIcon;
	let channelPath;
	let className = iconStyles.icon;
	if (channel.id === currentUserVoiceState?.channelId && settingsState.currentChannelColor)
		className = `${iconStyles.icon} ${iconStyles.iconCurrentCall}`;
	if (voiceState.selfStream) className = iconStyles.iconLive;
	if (guild) {
		text = guild.name;
		subtext = channel.name;
		TooltipIcon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.get("VOICE_CALL");
		TooltipIcon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			text = UserStore.getUser(channel.recipients[0]).username;
			subtext = Strings.get("PRIVATE_CALL");
			break;
		case 3:
			text = channel.name || groupDMName(channel.recipients);
			subtext = Strings.get("GROUP_CALL");
			TooltipIcon = People;
			break;
		case 13:
			TooltipIcon = Stage;
	}
	let Icon = Speaker;
	if (settingsState.showStatusIcons && (voiceState.selfDeaf || voiceState.deaf)) Icon = Deafened;
	else if (settingsState.showStatusIcons && (voiceState.selfMute || voiceState.mute)) Icon = Muted;
	else if (settingsState.showStatusIcons && voiceState.selfVideo) Icon = Video;
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
					TooltipIcon,
					{
						className: iconStyles.tooltipIcon,
						size: "16",
						width: "16",
						height: "16",
						color: "currentColor"
					}
				), BdApi.React.createElement("div", { style: { fontWeight: "400" } }, subtext)))
			},
			(props2) => BdApi.React.createElement("div", { ...props2 }, !voiceState.selfStream ? BdApi.React.createElement(Icon, { size: "14", width: "14", height: "14", color: "currentColor" }) : Strings.get("LIVE"))
		)
	);
}

// styles/voiceprofilesection.module.scss
const css$1 = `
.VoiceActivity-voiceprofilesection-section {
	position: relative;
	padding: 8px;
	border-radius: var(--radius-xs);
	background: var(--bg-mod-faint);
}
.VoiceActivity-voiceprofilesection-section:hover {
	background: var(--bg-mod-subtle);
}
.VoiceActivity-voiceprofilesection-panelSection {
	padding: 12px;
	border-radius: var(--radius-sm);
}
.theme-light.custom-profile-theme .VoiceActivity-voiceprofilesection-section {
	background: rgb(var(--bg-overlay-color)/0.4);
}
.theme-dark.custom-profile-theme .VoiceActivity-voiceprofilesection-section {
	background: rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-5));
}
.custom-profile-theme .VoiceActivity-voiceprofilesection-section:hover {
	background: linear-gradient(rgb(var(--bg-overlay-color-inverse)/0.05), rgb(var(--bg-overlay-color-inverse)/0.05)), var(--profile-gradient-end);
}
.VoiceActivity-voiceprofilesection-header {
	margin-bottom: 8px;
	display: flex;
	justify-content: space-between;
	gap: 4px;
}
.VoiceActivity-voiceprofilesection-headerText {
	color: var(--header-primary);
	font-size: 12px;
	line-height: 16px;
	font-family: var(--font-primary);
	font-weight: 500;
}
.VoiceActivity-voiceprofilesection-body {
	display: flex;
	flex-direction: row;
	gap: 8px;
}
.VoiceActivity-voiceprofilesection-details {
	display: flex;
	flex-direction: row;
	align-self: center;
	justify-content: space-between;
	width: 100%;
	gap: 8px;
	overflow: hidden;
}
.VoiceActivity-voiceprofilesection-text {
	color: var(--text-normal);
	overflow: hidden;
}
.VoiceActivity-voiceprofilesection-text > div, .VoiceActivity-voiceprofilesection-text > h3 {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.VoiceActivity-voiceprofilesection-text > h3 {
	font-size: 14px;
	line-height: 18px;
	font-weight: 600;
	font-family: var(--font-display);
}
.VoiceActivity-voiceprofilesection-text > div {
	font-size: 12px;
	line-height: 16px;
	font-weight: 400;
	font-family: var(--font-primary);
}
.VoiceActivity-voiceprofilesection-buttonWrapper {
	display: flex;
	flex: 0 1 auto;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: stretch;
	margin-top: 12px;
}
.VoiceActivity-voiceprofilesection-buttonWrapper > div[aria-label] {
	width: 32px;
	margin-right: 8px;
}
.VoiceActivity-voiceprofilesection-button {
	height: 32px;
	min-height: 32px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 2px 16px;
	border-radius: 8px;
	color: var(--button-secondary-text);
	font-size: 14px;
	line-height: 16px;
	font-weight: 500;
	user-select: none;
	transition-duration: 0.2s;
	border: 1px solid var(--opacity-white-8);
	border-color: var(--border-faint);
	background-color: var(--button-secondary-background);
	transition: background-color var(--custom-button-transition-duration) ease, color var(--custom-button-transition-duration) ease;
}
.VoiceActivity-voiceprofilesection-button:hover {
	background-color: var(--button-secondary-background-hover);
}
.VoiceActivity-voiceprofilesection-button:active {
	background-color: var(--button-secondary-background-active);
}
.VoiceActivity-voiceprofilesection-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	background-color: --button-secondary-background-disabled;
}
.custom-profile-theme .VoiceActivity-voiceprofilesection-button {
	transition: background var(--custom-button-transition-duration) ease-in-out;
	background: var(--profile-gradient-button-color);
	color: var(--white-500);
}
.custom-profile-theme .VoiceActivity-voiceprofilesection-button:hover {
	background: color-mix(in srgb, var(--profile-gradient-button-color) 80%, transparent);
}
.custom-profile-theme .VoiceActivity-voiceprofilesection-button:active {
	background: color-mix(in srgb, var(--profile-gradient-button-color) 90%, transparent);
}
.VoiceActivity-voiceprofilesection-joinWrapper .VoiceActivity-voiceprofilesection-joinButton {
	min-width: 32px;
	max-width: 32px;
	padding: 0;
}
.VoiceActivity-voiceprofilesection-joinWrapper .VoiceActivity-voiceprofilesection-joinButton:disabled {
	pointer-events: none;
}
.VoiceActivity-voiceprofilesection-joinWrapperDisabled {
	cursor: not-allowed;
}`;
_loadStyle("voiceprofilesection.module.scss", css$1);
const modules_9dbd3268 = {
	"section": "VoiceActivity-voiceprofilesection-section",
	"panelSection": "VoiceActivity-voiceprofilesection-panelSection",
	"header": "VoiceActivity-voiceprofilesection-header",
	"headerText": "VoiceActivity-voiceprofilesection-headerText",
	"body": "VoiceActivity-voiceprofilesection-body",
	"details": "VoiceActivity-voiceprofilesection-details",
	"text": "VoiceActivity-voiceprofilesection-text",
	"buttonWrapper": "VoiceActivity-voiceprofilesection-buttonWrapper",
	"button": "VoiceActivity-voiceprofilesection-button",
	"joinWrapper": "VoiceActivity-voiceprofilesection-joinWrapper",
	"joinButton": "VoiceActivity-voiceprofilesection-joinButton",
	"joinWrapperDisabled": "VoiceActivity-voiceprofilesection-joinWrapperDisabled"
};
const styles$1 = modules_9dbd3268;

// styles/guildimage.module.scss
const css = `
.VoiceActivity-guildimage-defaultIcon {
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 500;
	line-height: 1.2em;
	white-space: nowrap;
	background-color: var(--background-primary);
	color: var(--text-normal);
	min-width: 48px;
	width: 48px;
	height: 48px;
	border-radius: 16px;
	cursor: pointer;
	white-space: nowrap;
	overflow: hidden;
}`;
_loadStyle("guildimage.module.scss", css);
const modules_1a1e8d51 = {
	"defaultIcon": "VoiceActivity-guildimage-defaultIcon"
};
const styles = modules_1a1e8d51;

// assets/default_group_icon.png
const img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAABgmlDQ1BJQ0MgUHJvZmlsZQAAKM+VkTtIw1AYhb9WxQcVBzuIOGSoThZERRyliiIolFrB12CS2io0sSQtLo6Cq+DgY7Hq4OKsq4OrIAg+QBydnBRdROJ/U6FFqOCFcD/OzTnce34IFrOm5db2gGXnncRYTJuZndPqn6mlBmikTzfd3OTUaJKq6+OWgNpvoiqL/63m1JJrQkATHjJzTl54UXhgLZ9TvCscNpf1lPCpcLcjFxS+V7pR4hfFGZ+DKjPsJBPDwmFhLVPBRgWby44l3C8cSVm25AdnSpxSvK7YyhbMn3uqF4aW7OkppcvXwRjjTBJHw6DAClnyRGW3RXFJyHmsir/d98fFZYhrBVMcI6xioft+1Ax+d+um+3pLSaEY1D153lsn1G/D15bnfR563tcR1DzChV32rxZh8F30rbIWOYCWDTi7LGvGDpxvQttDTnd0X1LzD6bT8HoiY5qF1mtomi/19nPO8R0kpauJK9jbh66MZC9UeXdDZW9//uP3R+wbNjlyjzeozyoAAABgUExURVhl8oGK9LW7+erq/f///97i+7/F+mx38qGo92Ft8mFv8ujs/IuW9PP2/Wx384GM9Kux+MDF+urs/d/i+7S9+Jae9uDj/Jad9srO+tXY+4yU9aqy+MDE+qGn9/T1/neC9Liz/RcAAAAJcEhZcwAACxMAAAsTAQCanBgAAATqaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPg0KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmIzMjk5M2JmLTliZTUtNGJmMy04ZWEwLWY3ZDkzNTMyMTY2YiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNjhkOWE3MS1lYWU3LTRmZjAtYmMxZS04MGUwYmMxMTFkZDUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplZjU1ZGE0YS0wZTBhLTRjNTctODdmOC1lMmFmMGUyZGEzOGUiIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIiBHSU1QOkFQST0iMi4wIiBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIiBHSU1QOlRpbWVTdGFtcD0iMTY0ODk0NDg1NjM4ODc5MSIgR0lNUDpWZXJzaW9uPSIyLjEwLjI0IiB0aWZmOk9yaWVudGF0aW9uPSIxIiB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+DQogICAgICA8eG1wTU06SGlzdG9yeT4NCiAgICAgICAgPHJkZjpTZXE+DQogICAgICAgICAgPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ3NmFhOGE3LTVhNGEtNDcyNS05YTBjLWU1NzVmMzE1MzFmOCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIgc3RFdnQ6d2hlbj0iMjAyMi0wNC0wMlQxNzoxNDoxNiIgLz4NCiAgICAgICAgPC9yZGY6U2VxPg0KICAgICAgPC94bXBNTTpIaXN0b3J5Pg0KICAgIDwvcmRmOkRlc2NyaXB0aW9uPg0KICA8L3JkZjpSREY+DQo8L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9InIiPz6JoorbAAABV0lEQVRoQ+3W23KDIBAGYIOYBk20prWNPb7/W3Z3WQ9lGmeKe/l/N/+IzAYDggUAAAAAAMB/HVzpfXV8kIuTpp3gvHJ8WTcx7VRanlSBrs+aVubxMxn7RdNGq6VVR02Pmjb6WHjCQ+80baxmgDXUxA/FaSPWXUxtctOCVF2Z2uSmhauUnT1RU61p49cq9b6npoOmDV4yK7xN8G8abhfPsXIkq7MxfdGKOt0qBuOtoqjnZ3BcN9BmZ1qftP2L91cXt4ezJszCq7uVtENfytEN1ocZLZlRJ1iNQ2zvNHd6oyWfamLpd809wofWTBxllY6a+UJyFCzkPWsve9+35N9fG/k+nZySufjkveuTOvCuzZmp/WN+F1/859AjSuahLW0LD/2kmWdjBtiNunxr5kmOyhR/VfAk5H9dxDr3TX2kcw6psmHqI51zSJUNUx/pDAAAAAAAsKkofgB06RBbh+d86AAAAABJRU5ErkJggg==";
	const defaultGroupIcon = img;

// components/GuildImage.tsx
const getIconFontSize = (name) => {
	const words = name.split(" ");
	if (words.length > 7) return 10;
	else if (words.length === 6) return 12;
	else if (words.length === 5) return 14;
	else return 16;
};
const getImageLink = (guild, channel) => {
	let image = "";
	if (guild && guild.icon) {
		image = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`;
	} else if (channel.icon) {
		image = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
	} else if (channel.type === 3) {
		image = defaultGroupIcon;
	}
	return image;
};
function GuildImage(props) {
	const image = getImageLink(props.guild, props.channel);
	const onClick = () => {
		if (props.guild) GuildActions?.transitionToGuildSync(props.guild.id);
		else if (props.channelPath) transitionTo?.(props.channelPath);
	};
	if (image) {
		return BdApi.React.createElement(
			"img",
			{
				className: styles.icon,
				src: image,
				width: "48",
				height: "48",
				style: { borderRadius: "16px", cursor: "pointer" },
				onClick
			}
		);
	} else {
		return BdApi.React.createElement(
			"div",
			{
				className: styles.defaultIcon,
				onClick,
				style: { fontSize: `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }
			},
			getAcronym(props.guild ? props.guild.name : props.guild.id)
		);
	}
}

// components/VoiceProfileSection.tsx
function VoiceProfileSection(props) {
	const settingsState = Settings.useSettingsState(
		"showProfileSection",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds"
	);
	const voiceState = useUserVoiceState(props.userId);
	const currentUserVoiceState = useUserVoiceState(UserStore.getCurrentUser()?.id);
	if (!settingsState.showProfileSection) return null;
	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !canViewChannel(channel)) return null;
	const ignored = settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;
	const members = Object.keys(VoiceStateStore.getVoiceStatesForChannel(channel.id)).map(
		(id) => UserStore.getUser(id)
	);
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
		headerText = Strings.get("HEADER");
		text = [BdApi.React.createElement("h3", null, guild.name), BdApi.React.createElement("div", null, channel.name)];
		viewButton = Strings.get("VIEW");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED") : Strings.get("JOIN");
		Icon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		headerText = Strings.get("HEADER_VOICE");
		text = BdApi.React.createElement("h3", null, channel.name);
		viewButton = Strings.get("VIEW_CALL");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED_CALL") : Strings.get("JOIN_CALL");
		Icon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			headerText = Strings.get("HEADER_PRIVATE");
			break;
		case 3:
			headerText = Strings.get("HEADER_GROUP");
			text = [
				BdApi.React.createElement("h3", null, channel.name || groupDMName(channel.recipients)),
				BdApi.React.createElement("div", null, `${channel.recipients.length + 1} ${channel.recipients.length === 0 ? Strings.get("MEMBER") : Strings.get("MEMBERS")}`)
			];
			break;
		case 13:
			headerText = Strings.get("HEADER_STAGE");
			Icon = Stage;
	}
	const section = BdApi.React.createElement("div", { className: props.panel ? `${styles$1.section} ${styles$1.panelSection}` : styles$1.section }, BdApi.React.createElement("div", { className: styles$1.header }, BdApi.React.createElement("h3", { className: styles$1.headerText }, headerText), BdApi.React.createElement(MoreIcon, { user: UserStore.getUser(props.userId) })), !(channel.type === 1) && BdApi.React.createElement("div", { className: styles$1.body }, BdApi.React.createElement(GuildImage, { guild, channel, channelPath }), BdApi.React.createElement("div", { className: styles$1.details }, BdApi.React.createElement("div", { className: styles$1.text }, text), BdApi.React.createElement(
		PartyMembers,
		{
			channelId: channel.id,
			guildId: guild?.id,
			users: members,
			disableUserPopout: true,
			maxUsers: 3,
			overflowCountVariant: "text-xs/normal",
			size: "SIZE_16"
		}
	))), BdApi.React.createElement("div", { className: styles$1.buttonWrapper }, !isCurrentUser && BdApi.React.createElement(betterdiscord.Components.Tooltip, { text: joinButton, position: "top" }, (props2) => BdApi.React.createElement(
		"div",
		{
			...props2,
			className: inCurrentChannel ? `${styles$1.joinWrapper} ${styles$1.joinWrapperDisabled}` : styles$1.joinWrapper
		},
		BdApi.React.createElement(
			"button",
			{
				className: `${styles$1.button} ${styles$1.joinButton}`,
				disabled: inCurrentChannel,
				onClick: () => {
					if (channel.id) ChannelActions?.selectVoiceChannel(channel.id);
				},
				onContextMenu: (e) => {
					if (channel.type === 13) return;
					betterdiscord.ContextMenu.open(
						e,
						betterdiscord.ContextMenu.buildMenu([
							{
								label: Strings.get("JOIN_VIDEO"),
								id: "voice-activity-join-with-video",
								action: () => {
									if (channel.id)
										ChannelActions?.selectVoiceChannel(channel.id, true);
								}
							}
						])
					);
				}
			},
			BdApi.React.createElement(Icon, { size: "18", width: "18", height: "18", color: "currentColor" })
		)
	)), BdApi.React.createElement(
		"button",
		{
			className: styles$1.button,
			disabled: channelSelected,
			onClick: () => {
				if (channelPath) transitionTo?.(channelPath);
			}
		},
		viewButton
	)));
	return props.wrapper ? BdApi.React.createElement(props.wrapper, null, section) : section;
}

// index.tsx
const guildIconSelector = `div:not([data-dnd-name]) + ${iconWrapperSelector}`;
class VoiceActivity {
	meta;
	contextMenuUnpatches = new Set();
	constructor(meta) {
		this.meta = meta;
	}
	start() {
		showChangelog(changelog, this.meta);
		betterdiscord.DOM.addStyle(
			styles$2() + `${memberSelectors?.children}:empty { margin-left: 0; } ${memberSelectors?.children} { display: flex; gap: 8px; } ${memberSelectors?.layout} { width: 100%; }`
		);
		Strings.subscribe();
		this.patchPeopleListItem();
		this.patchMemberListItem();
		this.patchUserPanel();
		this.patchUserPopout();
		this.patchPrivateChannel();
		this.patchGuildIcon();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}
	patchUserPanel() {
		if (!UserPanelBody) return;
		const [module, key] = UserPanelBody;
		betterdiscord.Patcher.after(module, key, (_, [props], ret) => {
			ret.props.children.splice(1, 0, BdApi.React.createElement(VoiceProfileSection, { userId: props.user.id, panel: true }));
		});
	}
	patchUserPopout() {
		if (!UserPopoutBody) return;
		betterdiscord.Patcher.after(...UserPopoutBody, (_, [props], ret) => {
			ret.props.children.splice(7, 0, BdApi.React.createElement(VoiceProfileSection, { userId: props.user.id }));
		});
	}
	patchMemberListItem() {
		if (!MemberListItem) return;
		const [module, key] = MemberListItem;
		betterdiscord.Patcher.after(module, key, (_, [props], ret) => {
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
		const [module, key] = PrivateChannel;
		betterdiscord.Patcher.after(module, key, (_, __, containerRet) => {
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
	patchGuildIcon() {
		if (!GuildIcon) return;
		betterdiscord.Patcher.before(GuildIcon, "type", (_, [props]) => {
			if (!props?.guild) return;
			const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState(
				"showGuildIcons",
				"ignoredGuilds",
				"ignoredChannels"
			);
			const mediaState = useStateFromStores(
				[VoiceStateStore],
				() => getGuildMediaState(props.guild.id, ignoredChannels)
			);
			if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
				props.mediaState = { ...props.mediaState, ...mediaState };
			} else if (!props.mediaState.isCurrentUserConnected) {
				props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
			}
		});
		forceRerender(document.querySelector(guildIconSelector));
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
			ret.props.children[3].props.children.splice(2, 0, menuItem);
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
		forceRerender(document.querySelector(guildIconSelector));
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
				id: "showGuildIcons",
				type: "switch",
				name: Strings.get("SETTINGS_GUILD_ICONS"),
				note: Strings.get("SETTINGS_GUILD_ICONS_NOTE")
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