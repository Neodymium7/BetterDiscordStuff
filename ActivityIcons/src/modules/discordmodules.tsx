import { Webpack } from "betterdiscord";
import { expectSelectors, expectWithKey } from "@lib/utils/webpack";
import { AnyComponent } from "@lib/utils/react";

export const ActivityStatus = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("questsIcon", "CUSTOM_STATUS"),
	name: "ActivityStatus",
});

export const peopleListItemSelector = expectSelectors("People List Classes", ["peopleListItem"])?.peopleListItem;

export const memberSelector = expectSelectors("Member Class", ["memberInner", "member"])?.member;

export const privateChannelSelector = expectSelectors("Private Channel Classes", ["favoriteIcon", "channel"])?.channel;
