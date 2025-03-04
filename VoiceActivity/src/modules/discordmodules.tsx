import { Webpack } from "betterdiscord";
import { expectModule, expectSelectors, expectWithKey } from "@lib/utils/webpack";
import { AnyComponent, AnyMemo, EmptyComponent } from "@lib/utils/react";

export const MemberListItem = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("memberInner", "renderPopout"),
	name: "MemberListItem",
});

export const UserPanelBody = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("PANEL", "getUserProfile"),
	name: "UserPanelBody",
});

export const UserPopoutBody = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("BITE_SIZE", "UserProfilePopoutBody"),
	name: "UserPopoutBody",
});

export const PrivateChannel = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("PrivateChannel", "getTypingUsers"),
	name: "PrivateChannel",
	defaultExport: false,
});

export const GuildIcon = expectModule<AnyMemo>({
	filter: (m) => m?.type && Webpack.Filters.byStrings("GuildItem", "mediaState")(m.type),
	name: "GuildIcon",
});

export const PeopleListItem = expectModule<React.ComponentClass<any>>({
	filter: (m) => m?.prototype?.render && Webpack.Filters.byStrings("this.peopleListItemRef")(m),
	name: "PeopleListItem",
});

export const PartyMembers = expectModule({
	filter: Webpack.Filters.byStrings("overflowCountClassName"),
	name: "PartyMembers",
	fallback: EmptyComponent,
});

export const MoreIcon = expectModule({
	filter: Webpack.Filters.byStrings(".contextMenu", "colors.INTERACTIVE_NORMAL"),
	name: "MoreIcon",
	fallback: EmptyComponent,
});

export const Permissions = expectModule({
	filter: Webpack.Filters.byKeys("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "Permissions",
	fallback: {
		VIEW_CHANNEL: 1024n,
	},
});

export const getAcronym = expectModule({
	filter: Webpack.Filters.byStrings('.replace(/\'s /g," ").replace(/\\w+/g,'),
	searchExports: true,
	name: "getAcronym",
	fallback: (name: string) => name,
});

export const iconWrapperSelector = expectSelectors("Icon Wrapper Class", ["wrapper", "folderEndWrapper"])?.wrapper;

export const children = expectSelectors("Children Class", ["avatar", "children"])?.children;
