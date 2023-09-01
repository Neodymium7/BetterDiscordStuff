import { Webpack } from "betterdiscord";
import { expectModule, getStore, getSelectors, getClasses } from "@lib/utils/webpack";

const {
	Filters: { byProps, byStrings },
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

const ErrorPopout = (props: { message: string }) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		{props.message}
	</div>
);

export const MemberListItemContainer: any = expectModule({
	filter: (m) => m.type?.toString().includes("useName"),
	name: "MemberListItemContainer",
});

export const Permissions: any = expectModule({
	filter: byProps("computePermissions"),
	name: "Permissions",
	fatal: true,
});

export const DiscordPermissions = expectModule({
	filter: byProps("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "DiscordPermissions",
	fallback: {
		VIEW_CHANNEL: 1024n,
	},
});

export const GuildActions: any = expectModule({ filter: byProps("requestMembers"), name: "GuildActions" });

export const ChannelActions: any = expectModule({ filter: byProps("selectChannel"), name: "ChannelActions" });

export const UserPopoutSection = expectModule({
	filter: byStrings(".lastSection", ".children"),
	name: "UserPopoutSection",
	fallback: (props) => <div {...props} />,
});

export const useStateFromStores: any = expectModule({
	filter: byStrings("useStateFromStores"),
	name: "useStateFromStores",
	fatal: true,
});

export const transitionTo: (path: string) => null = expectModule({
	filter: byStrings("transitionTo -"),
	searchExports: true,
	name: "transitionTo",
});

export const getAcronym = expectModule({
	filter: byStrings('.replace(/\'s /g," ").replace(/\\w+/g,'),
	searchExports: true,
	name: "getAcronym",
	fallback: (i: string) => i,
});

export const Common = expectModule({
	filter: byProps("Popout", "Avatar"),
	name: "Common",
	fallback: {
		Popout: (props) => <div {...props} />,
		Avatar: (_props) => null,
	},
});

export const SwitchItem = expectModule({
	filter: (m) => m.toString?.().includes("().dividerDefault"),
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const Icons = {
	CallJoin: expectModule({
		filter: byStrings("M11 5V3C16.515 3 21 7.486"),
		name: "CallJoin",
		fallback: (_props: IconProps) => null,
	}),
	People: expectModule({
		filter: byStrings("M14 8.00598C14 10.211 12.206 12.006"),
		name: "People",
		fallback: (_props: IconProps) => null,
	}),
	Speaker: expectModule({
		filter: byStrings("M11.383 3.07904C11.009 2.92504 10.579 3.01004"),
		name: "Speaker",
		fallback: (_props: IconProps) => null,
	}),
	Muted: expectModule({
		filter: byStrings("M6.7 11H5C5 12.19 5.34 13.3"),
		name: "Muted",
		fallback: (_props: IconProps) => null,
	}),
	Deafened: expectModule({
		filter: byStrings("M6.16204 15.0065C6.10859 15.0022 6.05455 15"),
		name: "Deafened",
		fallback: (_props: IconProps) => null,
	}),
	Video: expectModule({
		filter: byStrings("M21.526 8.149C21.231 7.966 20.862 7.951"),
		name: "Video",
		fallback: (_props: IconProps) => null,
	}),
	Stage: expectModule({
		filter: byStrings(
			"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
		),
		name: "Stage",
		fallback: (_props: IconProps) => null,
	}),
};

export const peopleItemSelector = getSelectors("People Item Class", ["peopleListItem"]).peopleListItem;

export const iconWrapperSelector = getSelectors("Icon Wrapper Class", ["wrapper", "folderEndWrapper"]).wrapper;

export const children = getSelectors("Children Class", ["avatar", "children"]).children;

export const avatarMasked = getClasses("Masked Avatar Class", ["avatarMasked"]).avatarMasked;

export const partyMembersClasses = getClasses("Party Members Classes", [
	"wrapper",
	"partyMembers",
	"partyMemberOverflow",
]);

export const Stores = {
	UserStore: getStore("UserStore"),
	GuildChannelStore: getStore("GuildChannelStore"),
	VoiceStateStore: getStore("VoiceStateStore"),
	GuildStore: getStore("GuildStore"),
	ChannelStore: getStore("ChannelStore"),
	SelectedChannelStore: getStore("SelectedChannelStore"),
	GuildMemberStore: getStore("GuildMemberStore"),
};
