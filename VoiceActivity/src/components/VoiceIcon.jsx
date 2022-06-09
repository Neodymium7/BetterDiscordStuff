import React from "react";
import { useStateFromStores } from "@discord/flux";
import { Channels, Guilds, Users } from "@discord/stores";
import { DiscordModules, WebpackModules } from "@zlibrary";
import Settings from "../modules/settings";
import Strings from "../modules/strings";
import { groupDMName, checkPermissions } from "../modules/utils";
import style from "./voiceicon.scss";
import { CallJoin, People, Speaker, Stage } from "./icons";

const { NavigationUtils } = DiscordModules;
const VoiceStates = WebpackModules.getByProps("getVoiceStateForUser");

const { TooltipContainer } = WebpackModules.getByProps("TooltipContainer");

export default function VoiceIcon(props) {
	const showMemberListIcons = useStateFromStores([Settings], () => Settings.get("showMemberListIcons", true));
	const showDMListIcons = useStateFromStores([Settings], () => Settings.get("showDMListIcons", true));
	const showPeopleListIcons = useStateFromStores([Settings], () => Settings.get("showPeopleListIcons", true));
	const currentChannelColor = useStateFromStores([Settings], () => Settings.get("currentChannelColor", true));
	const ignoreEnabled = useStateFromStores([Settings], () => Settings.get("ignoreEnabled", false));
	const ignoredChannels = useStateFromStores([Settings], () => Settings.get("ignoredChannels", []));
	const ignoredGuilds = useStateFromStores([Settings], () => Settings.get("ignoredGuilds", []));

	const voiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(Users.getCurrentUser().id));

	if (props.context === "memberlist" && !showMemberListIcons) return null;
	if (props.context === "dmlist" && !showDMListIcons) return null;
	if (props.context === "peoplelist" && !showPeopleListIcons) return null;
	if (!voiceState) return null;
	const channel = Channels.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = Guilds.getGuild(channel.guild_id);

	if (guild && !checkPermissions(guild, channel)) return null;
	if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;

	let text, subtext, Icon, channelPath;
	let className = style.icon;
	if (channel.id === currentUserVoiceState?.channelId && currentChannelColor) className = `${style.icon} ${style.iconCurrentCall}`;
	if (voiceState.selfStream) className = style.iconLive;

	if (guild) {
		text = guild.name;
		subtext = channel.name;
		Icon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.get("VOICE_CALL");
		Icon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			text = Users.getUser(channel.recipients[0]).username;
			subtext = Strings.get("PRIVATE_CALL");
			break;
		case 3:
			text = channel.name ?? groupDMName(channel.recipients);
			subtext = Strings.get("GROUP_CALL");
			Icon = People;
			break;
		case 13:
			Icon = Stage;
	}

	return (
		<div
			className={className}
			onClick={e => {
				e.stopPropagation();
				if (channelPath) NavigationUtils.transitionTo(channelPath);
			}}
		>
			<TooltipContainer
				text={
					<div className={style.tooltip}>
						<div className={style.header} style={{ "font-weight": "600" }}>
							{text}
						</div>
						<div className={style.subtext}>
							<Icon className={style.tooltipIcon} width="16" height="16" />
							<div style={{ "font-weight": "400" }}>{subtext}</div>
						</div>
					</div>
				}
			>
				{!voiceState.selfStream ? <Speaker width="14" height="14" /> : Strings.get("LIVE")}
			</TooltipContainer>
		</div>
	);
}
