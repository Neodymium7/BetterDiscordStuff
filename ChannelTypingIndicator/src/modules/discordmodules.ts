import { Webpack } from "betterdiscord";
import { expectModule, expectWithKey } from "@lib/utils/webpack";
import { AnyComponent, AnyMemo, EmptyComponent } from "@lib/utils/react";

export const Channel = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("UNREAD_LESS_IMPORTANT"),
	name: "TypingUsersContainer",
});

export const Thread = expectModule<AnyMemo>({
	filter: (m) => m?.type && Webpack.Filters.byStrings("thread:", "GUILD_CHANNEL_LIST")(m.type),
	name: "Thread",
});

export const TypingDots = expectModule({
	filter: (m) => m?.type && Webpack.Filters.byStrings("dotRadius", "themed")(m.type),
	name: "TypingDots",
	searchExports: true,
	fallback: EmptyComponent,
});
