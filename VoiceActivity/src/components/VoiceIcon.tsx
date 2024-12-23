import { ChannelStore, GuildStore, UserStore } from "@discord/stores";
import { Settings, Strings, groupDMName, canViewChannel, useUserVoiceState } from "../modules/utils";
import styles from "../styles/voiceicon.module.scss";
import { CallJoin, Deafened, Muted, People, Speaker, Stage, Video } from "@discord/icons";
import { Components } from "betterdiscord";
import { transitionTo } from "@discord/modules";

interface VoiceIconProps {
	userId: string;
	context: string;
}

export default function VoiceIcon(props: VoiceIconProps): React.ReactNode {
	const settingsState = Settings.useSettingsState(
		"showMemberListIcons",
		"showDMListIcons",
		"showPeopleListIcons",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds",
		"currentChannelColor",
		"showStatusIcons"
	);

	const voiceState = useUserVoiceState(props.userId);
	const currentUserVoiceState = useUserVoiceState(UserStore.getCurrentUser()?.id);

	if (props.context === "memberlist" && !settingsState.showMemberListIcons) return null;
	if (props.context === "dmlist" && !settingsState.showDMListIcons) return null;
	if (props.context === "peoplelist" && !settingsState.showPeopleListIcons) return null;
	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !canViewChannel(channel)) return null;

	const ignored =
		settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;

	let text: string;
	let subtext: string;
	let TooltipIcon: React.FunctionComponent<any>;
	let channelPath: string;
	let className = styles.icon;

	if (channel.id === currentUserVoiceState?.channelId && settingsState.currentChannelColor)
		className = `${styles.icon} ${styles.iconCurrentCall}`;
	if (voiceState.selfStream) className = styles.iconLive;

	if (guild) {
		text = guild.name;
		subtext = channel.name;
		TooltipIcon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.get("VOICE_CALL");
		TooltipIcon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}

	switch (channel.type) {
		case 1:
			text = UserStore.getUser(channel.recipients[0]).username;
			subtext = Strings.get("PRIVATE_CALL");
			break;
		case 3:
			text = channel.name || groupDMName(channel.recipients);
			subtext = Strings.get("GROUP_CALL");
			TooltipIcon = People;
			break;
		case 13:
			TooltipIcon = Stage;
	}

	let Icon = Speaker;
	if (settingsState.showStatusIcons && (voiceState.selfDeaf || voiceState.deaf)) Icon = Deafened;
	else if (settingsState.showStatusIcons && (voiceState.selfMute || voiceState.mute)) Icon = Muted;
	else if (settingsState.showStatusIcons && voiceState.selfVideo) Icon = Video;

	return (
		<div
			className={className}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (channelPath) transitionTo?.(channelPath);
			}}
		>
			<Components.Tooltip
				text={
					<div className={styles.tooltip}>
						<div className={styles.header} style={{ fontWeight: "600" }}>
							{text}
						</div>
						<div className={styles.subtext}>
							<TooltipIcon
								className={styles.tooltipIcon}
								size="16"
								width="16"
								height="16"
								color="currentColor"
							/>
							<div style={{ fontWeight: "400" }}>{subtext}</div>
						</div>
					</div>
				}
			>
				{(props: any) => (
					<div {...props}>
						{!voiceState.selfStream ? (
							<Icon size="14" width="14" height="14" color="currentColor" />
						) : (
							Strings.get("LIVE")
						)}
					</div>
				)}
			</Components.Tooltip>
		</div>
	);
}
