import { GuildStore, UserStore } from "@discord/stores";
import { Settings, Strings, groupDMName } from "../modules/utils";
import styles from "../styles/voiceicon.module.css";
import { ChannelIcon, Deafened, Muted, ServerDeafened, ServerMuted, Speaker, Video } from "@discord/icons";
import { Components } from "betterdiscord";
import { transitionTo } from "@discord/modules";
import { useUserVoiceState } from "../modules/discordmodules";

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
		"showStatusIcons",
		"currentUserIcon"
	);

	const currentUser = UserStore.getCurrentUser();

	const { voiceState, voiceChannel: channel } = useUserVoiceState({ userId: props.userId });
	const { voiceState: currentUserVoiceState } = useUserVoiceState({ userId: currentUser?.id });

	if (props.context === "memberlist" && !settingsState.showMemberListIcons) return null;
	if (props.context === "dmlist" && !settingsState.showDMListIcons) return null;
	if (props.context === "peoplelist" && !settingsState.showPeopleListIcons) return null;
	if (props.userId === currentUser?.id && !settingsState.currentUserIcon) return null;
	if (!voiceState) return null;

	const guild = GuildStore.getGuild(channel.guild_id);

	const ignored =
		settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;

	let text: string;
	let subtext: string;
	let channelPath: string;
	let className = styles.icon;

	if (settingsState.currentChannelColor && channel.id === currentUserVoiceState?.channelId)
		className = `${styles.icon} ${styles.iconCurrentCall}`;
	if (voiceState.selfStream) className = styles.iconLive;

	if (guild) {
		text = guild.name;
		subtext = channel.name;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.get("VOICE_CALL");
		channelPath = `/channels/@me/${channel.id}`;
	}

	switch (channel.type) {
		case 1:
			text = UserStore.getUser(channel.recipients[0]).globalName;
			subtext = Strings.get("PRIVATE_CALL");
			break;
		case 3:
			text = channel.name || groupDMName(channel.recipients);
			subtext = Strings.get("GROUP_CALL");
			break;
	}

	let Icon = Speaker;
	if (settingsState.showStatusIcons) {
		if (voiceState.selfVideo) Icon = Video;
		else if (voiceState.deaf) Icon = ServerDeafened;
		else if (voiceState.selfDeaf) Icon = Deafened;
		else if (voiceState.mute) Icon = ServerMuted;
		else if (voiceState.selfMute) Icon = Muted;
	}

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
							<ChannelIcon
								className={styles.tooltipIcon}
								size="16"
								width="16"
								height="16"
								color="currentColor"
								channel={channel}
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
