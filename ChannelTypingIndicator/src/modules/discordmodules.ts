import { Webpack } from "betterdiscord";
import { expectModule } from "@lib/utils/webpack";

const {
	Filters: { byStrings },
} = Webpack;

export const Channel: any = expectModule({
	filter: byStrings("UNREAD_LESS_IMPORTANT"),
	name: "TypingUsersContainer",
	defaultExport: false,
});

export const Thread: any = expectModule({
	filter: (m) => m?.type && byStrings("thread:", "GUILD_CHANNEL_LIST")(m.type),
	name: "Thread",
});

export const TypingDots: any = expectModule({
	filter: (m) => m?.type?.render?.toString().includes("dotRadius"),
	name: "TypingDots",
	searchExports: true,
	fatal: true,
});

export const useStateFromStores: any = expectModule({
	filter: byStrings("useStateFromStores"),
	name: "Flux",
	searchExports: true,
	fatal: true,
});

export const UserStore = Webpack.getStore("UserStore");
export const GuildMemberStore = Webpack.getStore("GuildMemberStore");
export const RelationshipStore = Webpack.getStore("RelationshipStore");
export const TypingStore = Webpack.getStore("TypingStore");
