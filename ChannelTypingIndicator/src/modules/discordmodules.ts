import { Webpack } from "betterdiscord";
import { expectModule } from "@lib/utils/webpack";
import { AnyMemo, EmptyComponent } from "@lib/utils/react";

export const Thread = expectModule<AnyMemo>({
	filter: Webpack.Filters.bySource("thread:", "CHANNEL_LIST"),
	declarationFilter: Webpack.Filters.byComponentType(Webpack.Filters.byStrings("thread:", "CHANNEL_LIST")),
	name: "Thread",
});

export const TypingDots = expectModule({
	filter: (m) => m?.type && Webpack.Filters.byStrings("dotRadius", "themed")(m.type),
	name: "TypingDots",
	searchExports: true,
	fallback: EmptyComponent,
});
