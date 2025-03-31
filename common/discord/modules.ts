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

export const loadProfile = /* @__PURE__ */ expectModule<
	(userId: string, avatarURL: string, context: { guildId: string; channelId: string }) => void
>({
	filter: /* @__PURE__ */ Webpack.Filters.combine(
		/* @__PURE__ */ Webpack.Filters.byStrings("preloadUser"),
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
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("ACCOUNT", "CHANGE_LOG"),
	searchExports: true,
	name: "SettingsSections",
	fallback: { ACCOUNT: "My Account", ACTIVITY_PRIVACY: "Activity Privacy" },
});

export const UserSettingsWindow = /* @__PURE__ */ expectModule<{
	setSection: (section: string) => void;
	open: () => void;
}>({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("saveAccountChanges", "setSection", "open"),
	name: "UserSettingsWindow",
});
