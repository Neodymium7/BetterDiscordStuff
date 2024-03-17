import { Webpack } from "betterdiscord";
import { expectModule, getStore, getSelectors, getClasses, getIcon } from "@lib/utils/webpack";

const {
	Filters: { byKeys, byStrings },
} = Webpack;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const MemberListItem: any = expectModule({
	filter: byStrings("memberInner"),
	name: "MemberListItem",
	defaultExport: false,
});

export const UserPopoutBody: any = expectModule({
	filter: byStrings("hideNote", "canDM"),
	name: "UserPopoutBody",
	defaultExport: false,
});

export const PrivateChannelProfile: any = expectModule({
	filter: (m) => m.Inner,
	name: "PrivateChannelProfile",
	defaultExport: false,
});

export const PrivateChannelContainer: any = expectModule({
	filter: (m) => m.render?.toString().includes(".component", "innerRef"),
	name: "PrivateChannelContainer",
	searchExports: true,
});

export const canViewChannel = expectModule<any>({
	filter: (m) => m.canViewChannel,
	name: "canViewChannel",
	fatal: true,
})?.canViewChannel;

export const GuildActions: any = expectModule({ filter: byKeys("requestMembers"), name: "GuildActions" });

export const ChannelActions: any = expectModule({ filter: byKeys("selectChannel"), name: "ChannelActions" });

export const UserPopoutSection = expectModule({
	filter: byStrings(".lastSection", ".section"),
	name: "UserPopoutSection",
	fallback: (props) => <div {...props} />,
});

export const Flux: any = expectModule({
	filter: byKeys("useStateFromStores"),
	name: "Flux",
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
	filter: byKeys("Popout", "Avatar", "FormSwitch", "Tooltip"),
	name: "Common",
	fallback: {
		Popout: (props) => <div {...props} />,
		Avatar: (_props) => null,
		FormSwitch: Error,
		Tooltip: (props) => <div {...props} />,
	},
});

export const Icons = {
	CallJoin: getIcon("CallJoin", "M11 5V3C16.515 3 21 7.486"),
	People: getIcon("People", "M14 8.00598C14 10.211 12.206 12.006"),
	Speaker: getIcon("Speaker", "M11.383 3.07904C11.009 2.92504 10.579 3.01004"),
	Muted: getIcon("Muted", "M6.7 11H5C5 12.19 5.34 13.3"),
	Deafened: getIcon("Deafened", "M6.16204 15.0065C6.10859 15.0022 6.05455 15"),
	Video: getIcon("Video", "M21.526 8.149C21.231 7.966 20.862 7.951"),
	Stage: getIcon(
		"Stage",
		"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
	),
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
