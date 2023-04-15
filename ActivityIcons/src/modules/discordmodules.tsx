import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byProps, byStrings },
} = Webpack;

const { byValues, expectModule } = WebpackUtils;

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

export const ActivityStatus: any = expectModule(byValues(byStrings("applicationStream")), {
	name: "ActivityStatus",
	fatal: true,
});

export const Icons = {
	Activity: expectModule(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"), {
		name: "Activity",
		fallback: (props: IconProps) => null,
	}),
	RichActivity: expectModule(byStrings("M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"), {
		name: "RichActivity",
		fallback: (props: IconProps) => null,
	}),
	Headset: expectModule(byStrings("M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"), {
		name: "Headset",
		fallback: (props: IconProps) => null,
	}),
};

export const Margins = expectModule(byProps("marginXSmall"), {
	name: "Margins",
	fallback: {
		marginBottom8: "unknown-class",
	},
});

export const RadioGroup = expectModule((m) => m.Sizes && m.toString().includes("radioItemClassName"), {
	searchExports: true,
	name: "RadioGroup",
	fallback: Error,
});
export const SettingsItem = expectModule((m) => m.render?.toString().includes("required"), {
	searchExports: true,
	name: "SettingsItem",
	fallback: Error,
});
export const SettingsNote = expectModule((m) => m.Types && m.toString().includes("selectable"), {
	searchExports: true,
	name: "SettingsNote",
	fallback: Error,
});

export const peopleListItem = `.${
	expectModule(byProps("peopleListItem"), {
		name: "PeopleList Classes",
		fallback: { peopleListItem: "peoplelistitem" },
	}).peopleListItem
}`;
export const privateChannel = `.${
	expectModule(byProps("privateChannelsHeaderContainer"), {
		name: "Private Channel Classes",
		fallback: { scroller: "scroller" },
	}).scroller
} > ul > li`;
