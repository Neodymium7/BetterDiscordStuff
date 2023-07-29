import { SwitchItem } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settingsState = Settings.useSettingsState();

	return (
		<>
			<SwitchItem
				children={Strings.SETTINGS_NORMAL_ACTIVITY}
				note={Strings.SETTINGS_NORMAL_ACTIVITY_NOTE}
				value={settingsState.normalActivityIcons}
				onChange={(v: boolean) => {
					Settings.normalActivityIcons = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_RICH_PRESENCE}
				note={Strings.SETTINGS_RICH_PRESENCE_NOTE}
				value={settingsState.richPresenceIcons}
				onChange={(v: boolean) => {
					Settings.richPresenceIcons = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_PLATFORM}
				note={Strings.SETTINGS_PLATFORM_NOTE}
				value={settingsState.platformIcons}
				onChange={(v: boolean) => {
					Settings.platformIcons = v;
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
			<SwitchItem
				children={Strings.SETTINGS_WATCHING}
				note={Strings.SETTINGS_WATCHING_NOTE}
				value={settingsState.watchingIcons}
				onChange={(v: boolean) => {
					Settings.watchingIcons = v;
				}}
			/>
		</>
	);
}
