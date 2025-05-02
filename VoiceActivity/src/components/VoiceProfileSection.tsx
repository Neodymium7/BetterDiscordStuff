import { useUserVoiceState, VoiceActivityCard } from "../modules/discordmodules";
import { Settings } from "../modules/utils";
import { UserStore } from "@discord/stores";

interface VoiceProfileSectionProps {
	user: any;
	onClose?: any;
}

export default function VoiceProfileSection(props: VoiceProfileSectionProps) {
	const settingsState = Settings.useSettingsState(
		"showProfileSection",
		"ignoreEnabled",
		"ignoredChannels",
		"ignoredGuilds"
	);
	const { voiceState, voiceChannel: channel } = useUserVoiceState({ userId: props.user.id });

	if (!settingsState.showProfileSection) return null;
	if (!voiceState) return null;

	const ignored =
		settingsState.ignoredChannels.includes(channel.id) || settingsState.ignoredGuilds.includes(channel.guild_id);
	if (settingsState.ignoreEnabled && ignored) return null;

	return (
		<VoiceActivityCard
			currentUser={UserStore.getCurrentUser()}
			user={props.user}
			voiceChannel={channel}
			onClose={props.onClose}
		/>
	);
}
