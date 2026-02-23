import { Webpack } from "betterdiscord";
import { expectModule, expectSelectors, expectWithKey } from "@lib/utils/webpack";
import { AnyComponent } from "@lib/utils/react";
import { ChannelStore, PermissionStore, useStateFromStores, VoiceStateStore } from "@discord/stores";

// Adapted from Discord's useUserVoiceState function
export function useUserVoiceStateFallback({ userId }: { userId: string; guildId?: string }) {
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
			voiceState: voiceState,
			voiceChannel: channel,
		};
	} else return {};
}

export const MemberListItem = expectModule<React.MemoExoticComponent<AnyComponent>>({
	filter: (m) => m.type?.toString?.().includes("memberListItem"),
	name: "MemberListItem",
	searchExports: true,
});

export const PrivateChannel = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("getTypingUsers", "isMultiUserDM", "getRecipientId"),
	name: "PrivateChannel",
	searchExports: true,
});

export const PeopleListItem = expectModule<React.ComponentClass<any>>({
	filter: (m) => m?.prototype?.render && Webpack.Filters.byStrings("this.peopleListItemRef")(m),
	name: "PeopleListItem",
});

export const Permissions = expectModule({
	filter: Webpack.Filters.byKeys("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "Permissions",
	fallback: {
		VIEW_CHANNEL: 1024n,
	},
});

export const memberSelectors = expectSelectors("Children Class", ["avatar", "children", "layout"]);

export const useUserVoiceState = expectModule({
	filter: Webpack.Filters.byStrings("getDiscoverableVoiceState", "getDiscoverableVoiceStateForUser"),
	name: "useUserVoiceState",
	fallback: useUserVoiceStateFallback,
});
