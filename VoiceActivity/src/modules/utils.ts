import { Patcher, ReactUtils, Utils } from "betterdiscord";
import { createSettings, createStrings } from "bundlebd";
import { DiscordPermissions, Permissions, Stores } from "./discordmodules";
import locales from "../locales.json";

const { UserStore, GuildChannelStore, VoiceStateStore } = Stores;

export const Settings = createSettings({
	showProfileSection: true,
	showMemberListIcons: true,
	showDMListIcons: true,
	showPeopleListIcons: true,
	showGuildIcons: true,
	currentChannelColor: true,
	showStatusIcons: true,
	ignoreEnabled: false,
	ignoredChannels: [],
	ignoredGuilds: [],
});

export const Strings = createStrings(locales, "en-US");

export function checkPermissions(channel: any): boolean {
	return Permissions.can({
		permission: DiscordPermissions.VIEW_CHANNEL,
		user: UserStore.getCurrentUser(),
		context: channel,
	});
}

export const getGuildMediaState = (guildId: string, ignoredChannels: string[]) => {
	const vocalChannelIds = GuildChannelStore.getVocalChannelIds(guildId);
	let audio = false;
	let video = false;
	let screenshare = false;

	for (const id of vocalChannelIds) {
		if (ignoredChannels.includes(id)) continue;

		const voiceStates: any[] = Object.values(VoiceStateStore.getVoiceStatesForChannel(id));
		if (!voiceStates.length) continue;
		else audio = true;

		if (!video && VoiceStateStore.hasVideo(id)) video = true;
		if (!screenshare && voiceStates.some((voiceState) => voiceState.selfStream)) screenshare = true;
		if (audio && video && screenshare) break;
	}
	return { audio, video, screenshare };
};

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

export function forceUpdateAll(selector: string, propsFilter = (_) => true) {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);
	for (const element of elements) {
		const instance = ReactUtils.getInternalInstance(element);
		const stateNode = Utils.findInTree(
			instance,
			(n) => n && n.stateNode && n.stateNode.forceUpdate && propsFilter(n.stateNode.props),
			{ walkable: ["return"] }
		).stateNode;
		stateNode.forceUpdate();
	}
}

export function forceRerender(element: HTMLElement) {
	const ownerInstance = ReactUtils.getOwnerInstance(element);
	const cancel = Patcher.instead(ownerInstance, "render", () => {
		cancel();
		return null;
	});
	ownerInstance.forceUpdate(() => ownerInstance.forceUpdate());
}

export function waitForElement(selector: string) {
	return new Promise<void>((resolve) => {
		if (document.querySelector(selector)) {
			return resolve();
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector(selector)) {
				resolve();
				observer.disconnect();
			}
		});
		observer.observe(document, { childList: true, subtree: true });
	});
}
