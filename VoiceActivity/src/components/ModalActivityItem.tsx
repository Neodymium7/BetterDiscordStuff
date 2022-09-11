import { Webpack } from "betterdiscord";
import { DiscordModules, ContextMenu } from "zlibrary";
import React from "react";
import { Settings, Strings, VoiceStateStore, useStateFromStores, checkPermissions, groupDMName } from "../utils";
import styles from "../styles/modalactivityitem.scss?module";
import TooltipContainer from "./TooltipContainer";
import { CallJoin, Speaker, Stage } from "./icons";
import GuildImage from "./GuildImage";
import WrappedPartyAvatars from "./WrappedPartyAvatars";

const {
	Filters: { byProps },
	getModule
} = Webpack;

interface ModalActivityItemProps {
	userId: string;
}

const { NavigationUtils, ChannelActions, ChannelStore, GuildStore, UserStore } = DiscordModules;
const ComponentDispatcher = getModule(byProps("ComponentDispatch"))?.ComponentDispatch;

export default function ModalActivityItem(props: ModalActivityItemProps) {
	const { ignoreEnabled, ignoredChannels, ignoredGuilds } = Settings.useSettingsState();

	const voiceState = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStateStore], () =>
		VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser()?.id)
	);

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

	const members = Object.keys(VoiceStateStore.getVoiceStatesForChannel(channel.id)).map((id) =>
		UserStore.getUser(id)
	);
	const hasOverflow = members.length > 3;
	const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
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
			text = <h3>{channel.name ?? groupDMName(channel.recipients)}</h3>;
			break;
		case 13:
			headerText = Strings.get("HEADER_STAGE");
			Icon = Stage;
	}

	return (
		<div className={styles.modalActivity}>
			<h3 className={styles.header}>{headerText}</h3>
			<div className={styles.body}>
				{!(channel.type === 1) && (
					<React.Fragment>
						<GuildImage guild={guild} channel={channel} channelPath={channelPath} />
						<div className={styles.text}>{text}</div>
					</React.Fragment>
				)}
				<div className={styles.buttonContainer}>
					<button
						className={styles.button}
						onClick={() => {
							if (channelPath) {
								NavigationUtils.transitionTo(channelPath);
								ComponentDispatcher.dispatch("MODAL_CLOSE");
							}
						}}
					>
						{viewButton}
					</button>
					{!isCurrentUser && (
						<TooltipContainer
							text={joinButton}
							position="top"
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
												label: Strings.get("JOIN_VIDEO"),
												id: "voice-activity-join-with-video",
												action: () => {
													if (channel.id) ChannelActions.selectVoiceChannel(channel.id, true);
												}
											}
										])
									);
								}}
							>
								<Icon width="18" height="18" />
							</button>
						</TooltipContainer>
					)}
				</div>
			</div>
			{!(channel.type === 1) && (
				<div className={hasOverflow ? `${styles.members} ${styles.hasOverflow}` : styles.members}>
					<WrappedPartyAvatars guild={guild} channel={channel} members={members} />
				</div>
			)}
		</div>
	);
}
