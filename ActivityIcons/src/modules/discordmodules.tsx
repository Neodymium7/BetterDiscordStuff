import { Webpack } from "betterdiscord";
import { byValues, expectModule, getClasses, getSelectors } from "@lib/utils/webpack";

const {
	Filters: { byStrings },
} = Webpack;

interface IconProps {
	width?: string;
	height?: string;
	className?: string;
}

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const ActivityStatus: any = expectModule({
	filter: byValues(byStrings("applicationStream")),
	name: "ActivityStatus",
	fatal: true,
});

export const Icons = {
	Activity: expectModule({
		filter: byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"),
		name: "Activity",
		fallback: (_props: IconProps) => null,
	}),
	RichActivity: expectModule({
		filter: byStrings("M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"),
		name: "RichActivity",
		fallback: (_props: IconProps) => null,
	}),
	Headset: expectModule({
		filter: byStrings("M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"),
		name: "Headset",
		fallback: (_props: IconProps) => null,
	}),
};

export const SwitchItem = expectModule({
	filter: (m) => m.toString?.().includes("().dividerDefault"),
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const Margins = getClasses("Margins", ["marginBottom8"]);

export const peopleListItemSelector = getSelectors("People List Classes", ["peopleListItem"]).peopleListItem;

export const memberSelector = getSelectors("Member Class", ["memberInner", "member"]).member;

export const privateChannelSelector = getSelectors("Private Channel Classes", ["favoriteIcon", "channel"]).channel;
