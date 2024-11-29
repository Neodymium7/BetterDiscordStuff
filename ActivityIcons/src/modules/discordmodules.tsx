import { Webpack } from "betterdiscord";
import { expectModule, getClasses, getSelectors, getIcon } from "@lib/utils/webpack";

const {
	Filters: { byKeys, byStrings },
} = Webpack;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const ActivityStatus: any = expectModule({
	filter: byStrings("QuestsIcon", "hangStatusActivity"),
	name: "ActivityStatus",
	defaultExport: false,
	fatal: true,
});

export const Icons = {
	Activity: getIcon("Activity", "M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09"),
	RichActivity: getIcon("RichActivity", "M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"),
	Headset: getIcon("Headset", "M12 3a9 9 0 0 0-8.95 10h1.87a5 5 0 0 1 4.1 2.13l1.37 1.97a3.1 3.1 0 0"),
	Screen: getIcon("Screen", "M5 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5ZM13.5 20a.5.5"),
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
