import { expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const UserStore = /* @__PURE__ */ Webpack.getStore<any>("UserStore");
export const GuildChannelStore = /* @__PURE__ */ Webpack.getStore<any>("GuildChannelStore");
export const VoiceStateStore = /* @__PURE__ */ Webpack.getStore<any>("VoiceStateStore");
export const GuildStore = /* @__PURE__ */ Webpack.getStore<any>("GuildStore");
export const ChannelStore = /* @__PURE__ */ Webpack.getStore<any>("ChannelStore");
export const SelectedChannelStore = /* @__PURE__ */ Webpack.getStore<any>("SelectedChannelStore");
export const GuildMemberStore = /* @__PURE__ */ Webpack.getStore<any>("GuildMemberStore");
export const PermissionStore = /* @__PURE__ */ Webpack.getStore<any>("PermissionStore");
export const RelationshipStore = /* @__PURE__ */ Webpack.getStore<any>("RelationshipStore");
export const TypingStore = /* @__PURE__ */ Webpack.getStore<any>("TypingStore");
export const UserGuildSettingsStore = /* @__PURE__ */ Webpack.getStore<any>("UserGuildSettingsStore");
export const JoinedThreadsStore = /* @__PURE__ */ Webpack.getStore<any>("JoinedThreadsStore");

export const useStateFromStores = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.byStrings("useStateFromStores"),
	name: "Flux",
	fallback<T>(stores: any[], callback: () => T): T {
		return callback();
	},
	searchExports: true,
});
