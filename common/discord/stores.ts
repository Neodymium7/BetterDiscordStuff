import { expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const {
	UserStore,
	GuildChannelStore,
	VoiceStateStore,
	GuildStore,
	GuildRoleStore,
	ChannelStore,
	SelectedChannelStore,
	GuildMemberStore,
	PermissionStore,
	RelationshipStore,
	TypingStore,
	UserGuildSettingsStore,
	JoinedThreadsStore,
	PresenceStore,
} = Webpack.Stores;

export const useStateFromStores = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.byStrings("useStateFromStores"),
	name: "Flux",
	fallback<T>(stores: any[], callback: () => T): T {
		return callback();
	},
	searchExports: true,
});
