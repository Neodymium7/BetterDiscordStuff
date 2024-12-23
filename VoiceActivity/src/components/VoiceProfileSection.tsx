import { Components, ContextMenu } from "betterdiscord";
import { PartyMembers, MoreIcon } from "../modules/discordmodules";
import { Settings, Strings, groupDMName, canViewChannel, useUserVoiceState } from "../modules/utils";
import styles from "../styles/voiceprofilesection.module.scss";
import GuildImage from "./GuildImage";
import { ChannelStore, GuildStore, SelectedChannelStore, UserStore, VoiceStateStore } from "@discord/stores";
import { CallJoin, Speaker, Stage } from "@discord/icons";
import { ChannelActions, transitionTo } from "@discord/modules";

interface VoiceProfileSectionProps {
	userId: string;
	wrapper?: React.FunctionComponent<React.PropsWithChildren>;
	panel?: boolean;
}

export default function VoiceProfileSection(props: VoiceProfileSectionProps) {
	const settingsState = Settings.useSettingsState(
		"showProfileSection",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds"
	);

	const voiceState = useUserVoiceState(props.userId);
	const currentUserVoiceState = useUserVoiceState(UserStore.getCurrentUser()?.id);

	if (!settingsState.showProfileSection) return null;

	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !canViewChannel(channel)) return null;

	const ignored =
		settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(guild?.id);
	if (settingsState.ignoreEnabled && ignored) return null;

	const members = Object.keys(VoiceStateStore.getVoiceStatesForChannel(channel.id)).map((id) =>
		UserStore.getUser(id)
	);

	let headerText: string;
	let text: string | JSX.Element | JSX.Element[];
	let viewButton: string;
	let joinButton: string;
	let Icon: React.FunctionComponent<any>;
	let channelPath: string;

	const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
	const channelSelected = channel.id === SelectedChannelStore.getChannelId();
	const isCurrentUser = props.userId === UserStore.getCurrentUser().id;

	if (guild) {
		headerText = Strings.get("HEADER");
		text = [<h3>{guild.name}</h3>, <div>{channel.name}</div>];
		viewButton = Strings.get("VIEW");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED") : Strings.get("JOIN");
		Icon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		headerText = Strings.get("HEADER_VOICE");
		text = <h3>{channel.name}</h3>;
		viewButton = Strings.get("VIEW_CALL");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED_CALL") : Strings.get("JOIN_CALL");
		Icon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}

	switch (channel.type) {
		case 1:
			headerText = Strings.get("HEADER_PRIVATE");
			break;
		case 3:
			headerText = Strings.get("HEADER_GROUP");
			text = [
				<h3>{channel.name || groupDMName(channel.recipients)}</h3>,
				<div>
					{`${channel.recipients.length + 1} ${
						channel.recipients.length === 0 ? Strings.get("MEMBER") : Strings.get("MEMBERS")
					}`}
				</div>,
			];
			break;
		case 13:
			headerText = Strings.get("HEADER_STAGE");
			Icon = Stage;
	}

	const section = (
		<div className={props.panel ? `${styles.section} ${styles.panelSection}` : styles.section}>
			<div className={styles.header}>
				<h3 className={styles.headerText}>{headerText}</h3>
				<MoreIcon user={UserStore.getUser(props.userId)} />
			</div>
			{!(channel.type === 1) && (
				<div className={styles.body}>
					<GuildImage guild={guild} channel={channel} channelPath={channelPath} />
					<div className={styles.details}>
						<div className={styles.text}>{text}</div>
						<PartyMembers
							channelId={channel.id}
							guildId={guild?.id}
							users={members}
							disableUserPopout
							maxUsers={3}
							overflowCountVariant="text-xs/normal"
							size="SIZE_16"
						/>
					</div>
				</div>
			)}
			<div className={styles.buttonWrapper}>
				{!isCurrentUser && (
					<Components.Tooltip text={joinButton} position="top">
						{(props: any) => (
							<div
								{...props}
								className={
									inCurrentChannel
										? `${styles.joinWrapper} ${styles.joinWrapperDisabled}`
										: styles.joinWrapper
								}
							>
								<button
									className={`${styles.button} ${styles.joinButton}`}
									disabled={inCurrentChannel}
									onClick={() => {
										if (channel.id) ChannelActions?.selectVoiceChannel(channel.id);
									}}
									onContextMenu={(e) => {
										if (channel.type === 13) return;
										ContextMenu.open(
											e,
											ContextMenu.buildMenu([
												{
													label: Strings.get("JOIN_VIDEO"),
													id: "voice-activity-join-with-video",
													action: () => {
														if (channel.id)
															ChannelActions?.selectVoiceChannel(channel.id, true);
													},
												},
											])
										);
									}}
								>
									<Icon size="18" width="18" height="18" color="currentColor" />
								</button>
							</div>
						)}
					</Components.Tooltip>
				)}
				<button
					className={styles.button}
					disabled={channelSelected}
					onClick={() => {
						if (channelPath) transitionTo?.(channelPath);
					}}
				>
					{viewButton}
				</button>
			</div>
		</div>
	);

	return props.wrapper ? <props.wrapper>{section}</props.wrapper> : section;
}
