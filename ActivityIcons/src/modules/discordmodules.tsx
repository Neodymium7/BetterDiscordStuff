import { Webpack } from "betterdiscord";
import { expectClasses, expectSelectors, expectWithKey } from "@lib/utils/webpack";
import { AnyComponent } from "@lib/utils/react";

export const ActivityStatus = expectWithKey<AnyComponent>({
	filter: Webpack.Filters.byStrings("QuestsIcon", "hangStatusActivity"),
	name: "ActivityStatus",
});

export const marginClasses = expectClasses("Margins", ["marginBottom8"]);

export const peopleListItemSelector = expectSelectors("People List Classes", ["peopleListItem"])?.peopleListItem;

export const memberSelector = expectSelectors("Member Class", ["memberInner", "member"])?.member;

export const privateChannelSelector = expectSelectors("Private Channel Classes", ["favoriteIcon", "channel"])?.channel;
