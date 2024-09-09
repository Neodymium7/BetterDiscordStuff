import { Webpack } from "betterdiscord";
import { expectModule, getSelectors, getClasses, getIcon } from "@lib/utils/webpack";

const {
	Filters: { byKeys, byStrings },
	getStore,
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

export const UserPanelBody: any = expectModule({
	filter: byStrings("PANEL", "UserProfilePanelBody"),
	name: "UserPanelBody",
	defaultExport: false,
});

export const UserPopoutBody: any = expectModule({
	filter: byStrings("pronouns", "BITE_SIZE_PROFILE_POPOUT"),
	name: "UserPopoutBody",
	defaultExport: false,
});

export const PrivateChannelContainer: any = expectModule({
	filter: (m) => m.render?.toString().includes(".component", "innerRef"),
	name: "PrivateChannelContainer",
	searchExports: true,
});

export const PartyMembers: any = expectModule({
	filter: byStrings("partyMembers", "knownSize"),
	name: "PartyMembers",
	fallback: (_props) => null,
});

export const GuildActions: any = expectModule({ filter: byKeys("requestMembers"), name: "GuildActions" });

export const ChannelActions: any = expectModule({ filter: byKeys("selectChannel"), name: "ChannelActions" });

export const useStateFromStores: any = expectModule({
	filter: byStrings("useStateFromStores"),
	name: "Flux",
	fatal: true,
	searchExports: true,
});

export const Permissions = expectModule({
	filter: byKeys("VIEW_CREATOR_MONETIZATION_ANALYTICS"),
	searchExports: true,
	name: "Permissions",
	fallback: {
		VIEW_CHANNEL: 1024n,
	},
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
	CallJoin: getIcon("CallJoin", "M2 7.4A5.4 5.4 0 0 1 7.4 2c.36 0 .7.22.83.55l1.93 4.64a1 1"),
	People: getIcon("People", "M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 "),
	Speaker: getIcon("Speaker", "M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1"),
	Muted: getIcon("Muted", "m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4"),
	Deafened: getIcon("Deafened", "M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4"),
	Video: getIcon("Video", "M4 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h11a3 3"),
	Stage: getIcon("Stage", "M19.61 18.25a1.08 1.08 0 0 1-.07-1.33 9 9 0 1 0-15.07"),
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
	PermissionStore: getStore("PermissionStore"),
};
