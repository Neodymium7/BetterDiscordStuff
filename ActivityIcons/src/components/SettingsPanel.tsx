import { SwitchItem } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settingsState = Settings.useSettingsState();

	return (
		<>
			<SwitchItem
				children={Strings.SETTINGS_VOICE_ACTIVITY}
				note={Strings.SETTINGS_VOICE_ACTIVITY_NOTE}
				value={settingsState.voiceActivityIcons}
				onChange={(v: boolean) => {
					Settings.voiceActivityIcons = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_NORMAL_ACTIVITY}
				note={Strings.SETTINGS_NORMAL_ACTIVITY_NOTE}
				value={settingsState.normalActivityIcons}
				onChange={(v: boolean) => {
					Settings.normalActivityIcons = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_LISTENING}
				note={Strings.SETTINGS_LISTENING_NOTE}
				value={settingsState.listeningIcons}
				onChange={(v: boolean) => {
					Settings.listeningIcons = v;
				}}
			/>
		</>
	);
}
