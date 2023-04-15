import { Components, Webpack } from "betterdiscord";
import { DiscordModules, ContextMenu } from "zlibrary";
import { Settings, Strings, checkPermissions, groupDMName } from "../modules/utils";
import styles from "../styles/voiceprofilesection.module.scss";
import GuildImage from "./GuildImage";
import { GuildStore, Icons, VoiceStateStore, transitionTo, useStateFromStores } from "../modules/discordmodules";

const {
	getModule,
	Filters: { byStrings },
} = Webpack;

const { ChannelActions, ChannelStore, SelectedChannelStore, UserStore } = DiscordModules;

const UserPopoutSection = getModule(byStrings(".lastSection", ".children"));

interface VoiceProfileSectionProps {
	userId: string;
	wrapper?: React.FunctionComponent;
}

export default function VoiceProfileSection(props: VoiceProfileSectionProps) {
	const { showProfileSection, ignoreEnabled, ignoredChannels, ignoredGuilds } = Settings.useSettingsState();

	const voiceState = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStateStore], () =>
		VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser()?.id)
	);

	if (!showProfileSection) return null;

	if (!voiceState) return null;
	const channel = ChannelStore.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild && !checkPermissions(channel)) return null;

	if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;

	let headerText: string;
	let text: string | JSX.Element | JSX.Element[];
	let viewButton: string;
	let joinButton: string;
	let Icon: React.FunctionComponent<{ width: string; height: string }>;
	let channelPath: string;

	const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
	const channelSelected = channel.id === SelectedChannelStore.getChannelId();
	const isCurrentUser = props.userId === UserStore.getCurrentUser().id;

	if (guild) {
		headerText = Strings.HEADER;
		text = [<h3>{guild.name}</h3>, <div>{channel.name}</div>];
		viewButton = Strings.VIEW;
		joinButton = inCurrentChannel ? Strings.JOIN_DISABLED : Strings.JOIN;
		Icon = Icons.Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		headerText = Strings.HEADER_VOICE;
		text = <h3>{channel.name}</h3>;
		viewButton = Strings.VIEW_CALL;
		joinButton = inCurrentChannel ? Strings.JOIN_DISABLED_CALL : Strings.JOIN_CALL;
		Icon = Icons.CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			headerText = Strings.HEADER_PRIVATE;
			break;
		case 3:
			headerText = Strings.HEADER_GROUP;
			text = <h3>{channel.name || groupDMName(channel.recipients)}</h3>;
			break;
		case 13:
			headerText = Strings.HEADER_STAGE;
			Icon = Icons.Stage;
	}

	const section = (
		<UserPopoutSection>
			<h3 className={styles.header}>{headerText}</h3>
			{!(channel.type === 1) && (
				<div className={styles.body}>
					<GuildImage guild={guild} channel={channel} channelPath={channelPath} />
					<div className={styles.text}>{text}</div>
				</div>
			)}
			<div className={styles.buttonWrapper}>
				<button
					className={styles.button}
					disabled={channelSelected}
					onClick={() => {
						if (channelPath) transitionTo(channelPath);
					}}
				>
					{viewButton}
				</button>
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
										if (channel.id) ChannelActions.selectVoiceChannel(channel.id);
									}}
									onContextMenu={(e) => {
										if (channel.type === 13) return;
										ContextMenu.openContextMenu(
											e,
											ContextMenu.buildMenu([
												{
													label: Strings.JOIN_VIDEO,
													id: "voice-activity-join-with-video",
													action: () => {
														if (channel.id)
															ChannelActions.selectVoiceChannel(channel.id, true);
													},
												},
											])
										);
									}}
								>
									<Icon width="18" height="18" />
								</button>
							</div>
						)}
					</Components.Tooltip>
				)}
			</div>
		</UserPopoutSection>
	);

	return props.wrapper ? <props.wrapper>{section}</props.wrapper> : section;
}
