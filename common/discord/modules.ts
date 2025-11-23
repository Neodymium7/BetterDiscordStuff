import { byType, expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const transitionTo = /* @__PURE__ */ expectModule<(path: string) => void>({
	filter: /* @__PURE__ */ Webpack.Filters.combine(
		/* @__PURE__ */ Webpack.Filters.byStrings("transitionTo -"),
		/* @__PURE__ */ byType("function")
	),
	searchExports: true,
	name: "transitionTo",
});

export const loadProfile = /* @__PURE__ */ expectModule<(userId: string, avatarURL: string, context: any) => void>({
	filter: /* @__PURE__ */ Webpack.Filters.combine(
		/* @__PURE__ */ Webpack.Filters.byStrings("getAvatarURL", "Refetch"),
		/* @__PURE__ */ byType("function")
	),
	name: "loadProfile",
});

export const GuildActions = /* @__PURE__ */ expectModule<{ transitionToGuildSync(guildId: string): void }>({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("requestMembers", "transitionToGuildSync"),
	name: "GuildActions",
});

export const ChannelActions = /* @__PURE__ */ expectModule<{
	selectVoiceChannel(channelId: string, x?: boolean): void;
}>({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("selectChannel", "selectVoiceChannel"),
	name: "ChannelActions",
});

export const SettingsSections = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("ACTIVITY_PRIVACY_PANEL", "ACCOUNT_PANEL"),
	searchExports: true,
	name: "SettingsSections",
	fallback: { ACTIVITY_PRIVACY_PANEL: "activity_privacy_panel" },
});

export const UserSettings = /* @__PURE__ */ expectModule<{
	openUserSettings: (section: string) => void;
}>({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("openUserSettings"),
	name: "UserSettings",
});
