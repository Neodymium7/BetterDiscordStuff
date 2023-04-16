import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byProps, byStrings },
	getModule,
} = Webpack;

const { expectModule, store } = WebpackUtils;

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

export const Permissions: any = expectModule(byProps("computePermissions"), {
	name: "Permissions",
	fatal: true,
});

export const DiscordPermissions = expectModule(byProps("VIEW_CREATOR_MONETIZATION_ANALYTICS"), {
	searchExports: true,
	name: "DiscordPermissions",
	fallback: {
		VIEW_CHANNEL: 1024n,
	},
});

export const GuildActions: any = expectModule(byProps("requestMembers"), { name: "GuildActions" });

export const ChannelActions: any = expectModule(byProps("selectChannel"), { name: "ChannelActions" });

export const UserPopoutSection = expectModule(byStrings(".lastSection", ".children"), {
	name: "UserPopoutSection",
	fallback: (props) => <div {...props} />,
});

export const useStateFromStores: any = expectModule(byStrings("useStateFromStores"), {
	name: "useStateFromStores",
	fatal: true,
});

export const transitionTo: (path: string) => null = expectModule(byStrings("transitionTo -"), {
	searchExports: true,
	name: "transitionTo",
});

export const getAcronym = expectModule(byStrings('.replace(/\'s /g," ").replace(/\\w+/g,'), {
	searchExports: true,
	name: "getAcronym",
	fallback: (i: string) => i,
});

export const SwitchItem = expectModule((m) => m.toString?.().includes("().dividerDefault"), {
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const Icons = {
	CallJoin: expectModule(byStrings("M11 5V3C16.515 3 21 7.486"), {
		name: "CallJoin",
		fallback: (_props: IconProps) => null,
	}),
	People: expectModule(byStrings("M14 8.00598C14 10.211 12.206 12.006"), {
		name: "People",
		fallback: (_props: IconProps) => null,
	}),
	Speaker: expectModule(byStrings("M11.383 3.07904C11.009 2.92504 10.579 3.01004"), {
		name: "Speaker",
		fallback: (_props: IconProps) => null,
	}),
	Muted: expectModule(byStrings("M6.7 11H5C5 12.19 5.34 13.3"), {
		name: "Muted",
		fallback: (_props: IconProps) => null,
	}),
	Deafened: expectModule(byStrings("M6.16204 15.0065C6.10859 15.0022 6.05455 15"), {
		name: "Deafened",
		fallback: (_props: IconProps) => null,
	}),
	Video: expectModule(byStrings("M21.526 8.149C21.231 7.966 20.862 7.951"), {
		name: "Video",
		fallback: (_props: IconProps) => null,
	}),
	Stage: expectModule(
		byStrings(
			"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
		),
		{ name: "Stage", fallback: (_props: IconProps) => null }
	),
};

export const memberItemClass = expectModule<{ member: string }>(byProps("member", "activity"), {
	name: "Member Item Class",
})?.member;

export const privateChannelClass = expectModule<{ channel: string }>(byProps("channel", "activity"), {
	name: "Private Channel Class",
})?.channel;

export const peopleItemClass = expectModule<{ peopleListItem: string }>(byProps("peopleListItem"), {
	name: "People Item Class",
})?.peopleListItem;

export const guildIconClass = expectModule<{ wrapper: string }>(byProps("folderEndWrapper"), {
	name: "Guild Icon Class",
})?.wrapper;

export const children = expectModule<{ children: string }>(byProps("avatar", "children"), {
	name: "Children Class",
})?.children;

export const UserStore = getModule(store("UserStore"));
export const GuildChannelStore = getModule(store("GuildChannelStore"));
export const VoiceStateStore = getModule(store("VoiceStateStore"));
export const GuildStore = getModule(store("GuildStore"));
export const ChannelStore = getModule(store("ChannelStore"));
export const SelectedChannelStore = getModule(store("SelectedChannelStore"));
