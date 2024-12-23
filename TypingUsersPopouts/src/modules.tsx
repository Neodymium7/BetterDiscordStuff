import { AnyComponent } from "@lib/utils/react";
import { expectSelectors, expectWithKey } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const TypingUsersContainer = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("typingUsers:"),
	name: "TypingUsersContainer",
	fatal: true,
});

export const typingSelector = expectSelectors("Typing Class", ["typingDots", "typing"])?.typing;
