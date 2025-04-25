import { SettingsManager, StringsManager } from "@lib";
import locales from "../locales.json";
import { UserStore } from "@discord/stores";

export const Settings = new SettingsManager({
	showProfileSection: true,
	showMemberListIcons: true,
	showDMListIcons: true,
	showPeopleListIcons: true,
	currentChannelColor: true,
	showStatusIcons: true,
	currentUserIcon: true,
	ignoreEnabled: false,
	ignoredChannels: [] as string[],
	ignoredGuilds: [] as string[],
});

export const Strings = new StringsManager(locales, "en-US");

export function groupDMName(members: any[]): string {
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
