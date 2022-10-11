import { Webpack } from "betterdiscord";
import { DiscordModules, ReactTools } from "zlibrary";
import { SettingsManager, StringsManager } from "bundlebd";
import locales from "./locales.json";
import defaultGroupIcon from "./assets/default_group_icon.png";

const {
	Filters: { byProps, byStrings },
	getModule
} = Webpack;

const { Permissions, UserStore } = DiscordModules;
const DiscordPermissions = getModule(byProps("VIEW_CREATOR_MONETIZATION_ANALYTICS"), { searchExports: true });

export const Settings = new SettingsManager({
	showMemberListIcons: true,
	showDMListIcons: true,
	showPeopleListIcons: true,
	currentChannelColor: true,
	ignoreEnabled: false,
	ignoredChannels: [],
	ignoredGuilds: []
});

export const Strings = new StringsManager(locales);

export const useStateFromStores = getModule(byStrings("useStateFromStores"));
export const transitionTo = getModule(byStrings("transitionTo -"), { searchExports: true });
export const VoiceStateStore = getModule(byProps("getVoiceStateForUser"));
export const GuildStore = getModule(byProps("getGuildCount"));

export const withProps = (filter: (m: any) => boolean) => {
	return (m) => Object.values(m).some(filter);
};

export function checkPermissions(channel: any): boolean {
	return Permissions.can({
		permission: DiscordPermissions.VIEW_CHANNEL,
		user: UserStore.getCurrentUser(),
		context: channel
	});
}

export function forceUpdateAll(selector: string) {
	document.querySelectorAll(selector).forEach((node) => {
		ReactTools.getStateNodes(node as HTMLElement).forEach((e) => e.forceUpdate());
	});
}

export function getIconFontSize(name: string) {
	const words = name.split(" ");
	if (words.length > 7) return 10;
	else if (words.length === 6) return 12;
	else if (words.length === 5) return 14;
	else return 16;
}

export function getImageLink(guild: any, channel: any) {
	let image: string;
	if (guild && guild.icon) {
		image = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`;
	} else if (channel.icon) {
		image = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
	} else if (channel.type === 3) {
		image = defaultGroupIcon;
	}
	return image;
}

export function groupDMName(members: any[]): string {
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
