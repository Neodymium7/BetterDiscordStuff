import { Logger, Patcher, ReactUtils } from "betterdiscord";
import { SettingsManager, StringsManager } from "@lib";
import { Permissions } from "./discordmodules";
import locales from "../locales.json";
import {
	ChannelStore,
	GuildChannelStore,
	PermissionStore,
	UserStore,
	useStateFromStores,
	VoiceStateStore,
} from "@discord/stores";

export const Settings = new SettingsManager({
	showProfileSection: true,
	showMemberListIcons: true,
	showDMListIcons: true,
	showPeopleListIcons: true,
	showGuildIcons: true,
	currentChannelColor: true,
	showStatusIcons: true,
	ignoreEnabled: false,
	ignoredChannels: [] as string[],
	ignoredGuilds: [] as string[],
});

export const Strings = new StringsManager(locales, "en-US");

export const canViewChannel = (channel: any): boolean => {
	return PermissionStore.can(Permissions.VIEW_CHANNEL, channel);
};

export const getGuildMediaState = (guildId: string, ignoredChannels: string[]) => {
	const vocalChannelIds = GuildChannelStore.getVocalChannelIds(guildId);
	let audio = false;
	let video = false;
	let screenshare = false;

	for (const id of vocalChannelIds) {
		if (ignoredChannels.includes(id)) continue;

		const voiceStates: any[] = Object.values(VoiceStateStore.getVoiceStatesForChannel(id));
		if (!voiceStates.length) continue;
		if (ChannelStore.getChannel(id).type !== 13) audio = true;

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

export function forceRerender(element: HTMLElement | null) {
	if (!element) return Logger.error("Force rerender failed: target element not found");
	const ownerInstance = ReactUtils.getOwnerInstance(element);
	if (!ownerInstance) return Logger.error("Force rerender failed: ownerInstance component not found");
	const cancel = Patcher.instead(ownerInstance, "render", () => {
		cancel();
		return null;
	});
	ownerInstance.forceUpdate(() => ownerInstance.forceUpdate());
}

export function useUserVoiceState(userId: string) {
	return useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(userId));
}
