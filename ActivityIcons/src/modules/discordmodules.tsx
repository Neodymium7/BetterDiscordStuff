import { Webpack } from "betterdiscord";
import { expectModule, getClasses, getSelectors, getIcon } from "@lib/utils/webpack";

const {
	Filters: { byKeys },
} = Webpack;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const ActivityStatus: any = expectModule({
	filter: byKeys("ActivityEmoji"),
	name: "ActivityStatus",
	fatal: true,
});

export const Icons = {
	Activity: getIcon("Activity", "M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"),
	RichActivity: getIcon("RichActivity", "M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"),
	Headset: getIcon("Headset", "M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"),
	Screen: getIcon("Screen", "M4 2.5C2.897 2.5 2 3.397 2 4.5V15.5C2 16.604 2.897"),
};

export const Common = expectModule({
	filter: byKeys("FormSwitch"),
	name: "Common",
	fallback: {
		FormSwitch: Error,
	},
});

export const Margins = getClasses("Margins", ["marginBottom8"]);

export const peopleListItemSelector = getSelectors("People List Classes", ["peopleListItem"]).peopleListItem;

export const memberSelector = getSelectors("Member Class", ["memberInner", "member"]).member;

export const privateChannelSelector = getSelectors("Private Channel Classes", ["favoriteIcon", "channel"]).channel;
