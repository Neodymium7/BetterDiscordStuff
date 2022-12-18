import { Patcher, ReactUtils, Webpack } from "betterdiscord";
import { DiscordModules, ReactTools } from "zlibrary";
import { createSettings, createStrings } from "bundlebd";
import locales from "./locales.json";

const {
	Filters: { byProps, byStrings },
	getModule,
} = Webpack;

const { Permissions, UserStore } = DiscordModules;
const DiscordPermissions = getModule(byProps("VIEW_CREATOR_MONETIZATION_ANALYTICS"), { searchExports: true });

export const Settings = createSettings({
	showProfileSection: true as boolean,
	showMemberListIcons: true as boolean,
	showDMListIcons: true as boolean,
	showPeopleListIcons: true as boolean,
	showGuildIcons: true as boolean,
	currentChannelColor: true as boolean,
	showStatusIcons: true as boolean,
	ignoreEnabled: false as boolean,
	ignoredChannels: [],
	ignoredGuilds: [],
});

export const Strings = createStrings(locales, "en-US");

export const useStateFromStores = getModule(byStrings("useStateFromStores"));
export const transitionTo = getModule(byStrings("transitionTo -"), { searchExports: true });
export const VoiceStateStore = getModule(byProps("getVoiceStateForUser"));
export const GuildStore = getModule(byProps("getGuildCount"));

export function checkPermissions(channel: any): boolean {
	return Permissions.can({
		permission: DiscordPermissions.VIEW_CHANNEL,
		user: UserStore.getCurrentUser(),
		context: channel,
	});
}

export function forceUpdateAll(selector: string) {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);
	for (const element of elements) {
		const stateNodes = ReactTools.getStateNodes(element);
		for (const stateNode of stateNodes) stateNode.forceUpdate();
	}
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

export function forceRerender(element: HTMLElement) {
	const ownerInstance = ReactUtils.getOwnerInstance(element);
	const cancel = Patcher.instead(ownerInstance, "render", () => {
		cancel();
		return null;
	});
	ownerInstance.forceUpdate(() => ownerInstance.forceUpdate());
}
