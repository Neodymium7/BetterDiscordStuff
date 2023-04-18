import { Components } from "betterdiscord";
import { Settings, Strings, checkPermissions, groupDMName } from "../modules/utils";
import { Icons, Stores, transitionTo, useStateFromStores } from "../modules/discordmodules";
import styles from "../styles/voiceicon.module.scss";

interface VoiceIconProps {
	userId: string;
	context: string;
}

const { ChannelStore, GuildStore, UserStore, VoiceStateStore } = Stores;

export default function VoiceIcon(props: VoiceIconProps) {
	const {
		showMemberListIcons,
		showDMListIcons,
		showPeopleListIcons,
		ignoreEnabled,
		ignoredChannels,
		ignoredGuilds,
		currentChannelColor,
		showStatusIcons,
	} = Settings.useSettingsState();

	const voiceState = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStateStore], () =>
		VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser()?.id)
	);

	if (props.context === "memberlist" && !showMemberListIcons) return null;
	if (props.context === "dmlist" && !showDMListIcons) return null;
	if (props.context === "peoplelist" && !showPeopleListIcons) return null;
	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !checkPermissions(channel)) return null;

	if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;

	let text: string;
	let subtext: string;
	let TooltipIcon: React.FunctionComponent<{ width: string; height: string; className: string }>;
	let channelPath: string;
	let className = styles.icon;

	if (channel.id === currentUserVoiceState?.channelId && currentChannelColor)
		className = `${styles.icon} ${styles.iconCurrentCall}`;
	if (voiceState.selfStream) className = styles.iconLive;

	if (guild) {
		text = guild.name;
		subtext = channel.name;
		TooltipIcon = Icons.Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		text = channel.name;
		subtext = Strings.VOICE_CALL;
		TooltipIcon = Icons.CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			text = UserStore.getUser(channel.recipients[0]).username;
			subtext = Strings.PRIVATE_CALL;
			break;
		case 3:
			text = channel.name || groupDMName(channel.recipients);
			subtext = Strings.GROUP_CALL;
			TooltipIcon = Icons.People;
			break;
		case 13:
			TooltipIcon = Icons.Stage;
	}

	let Icon = Icons.Speaker;
	if (showStatusIcons && (voiceState.selfDeaf || voiceState.deaf)) Icon = Icons.Deafened;
	else if (showStatusIcons && (voiceState.selfMute || voiceState.mute)) Icon = Icons.Muted;
	else if (showStatusIcons && voiceState.selfVideo) Icon = Icons.Video;

	return (
		<div
			className={className}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (channelPath) transitionTo(channelPath);
			}}
		>
			<Components.Tooltip
				text={
					<div className={styles.tooltip}>
						<div className={styles.header} style={{ fontWeight: "600" }}>
							{text}
						</div>
						<div className={styles.subtext}>
							<TooltipIcon className={styles.tooltipIcon} width="16" height="16" />
							<div style={{ fontWeight: "400" }}>{subtext}</div>
						</div>
					</div>
				}
			>
				{(props: any) => (
					<div {...props}>{!voiceState.selfStream ? <Icon width="14" height="14" /> : Strings.LIVE}</div>
				)}
			</Components.Tooltip>
		</div>
	);
}
