import React from "react";
import { DiscordModules, WebpackModules } from "@zlibrary";
import Settings from "bundlebd/settings";
import Strings from "bundlebd/strings";
import { groupDMName, checkPermissions } from "../utils";
import style from "./voiceicon.scss?module";
import { CallJoin, People, Speaker, Stage } from "./icons";

const { NavigationUtils, ChannelStore, GuildStore, UserStore } = DiscordModules;
const { useStateFromStores } = WebpackModules.getByProps("useStateFromStores");
const VoiceStates = WebpackModules.getByProps("getVoiceStateForUser");

const { TooltipContainer } = WebpackModules.getByProps("TooltipContainer");

export default function VoiceIcon(props) {
	const showMemberListIcons = Settings.useSettingState("showMemberListIcons");
	const showDMListIcons = Settings.useSettingState("showDMListIcons");
	const showPeopleListIcons = Settings.useSettingState("showPeopleListIcons");
	const currentChannelColor = Settings.useSettingState("currentChannelColor");
	const ignoreEnabled = Settings.useSettingState("ignoreEnabled");
	const ignoredChannels = Settings.useSettingState("ignoredChannels");
	const ignoredGuilds = Settings.useSettingState("ignoredGuilds");

	const voiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStates], () =>
		VoiceStates.getVoiceStateForUser(UserStore.getCurrentUser()?.id)
	);

	if (props.context === "memberlist" && !showMemberListIcons) return null;
	if (props.context === "dmlist" && !showDMListIcons) return null;
	if (props.context === "peoplelist" && !showPeopleListIcons) return null;
	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	if (!checkPermissions(channel)) return null;
	const guild = GuildStore.getGuild(channel.guild_id);

	if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;

	let text, subtext, Icon, channelPath;
	let className = style.icon;
	if (channel.id === currentUserVoiceState?.channelId && currentChannelColor)
		className = `${style.icon} ${style.iconCurrentCall}`;
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
			text = UserStore.getUser(channel.recipients[0]).username;
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
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (channelPath) NavigationUtils.transitionTo(channelPath);
			}}
		>
			<TooltipContainer
				text={
					<div className={style.tooltip}>
						<div className={style.header} style={{ fontWeight: "600" }}>
							{text}
						</div>
						<div className={style.subtext}>
							<Icon className={style.tooltipIcon} width="16" height="16" />
							<div style={{ fontWeight: "400" }}>{subtext}</div>
						</div>
					</div>
				}
			>
				{!voiceState.selfStream ? <Speaker width="14" height="14" /> : Strings.get("LIVE")}
			</TooltipContainer>
		</div>
	);
}
