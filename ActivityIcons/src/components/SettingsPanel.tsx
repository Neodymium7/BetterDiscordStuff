import { Common } from "@discord/components";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settingsState = Settings.useSettingsState();

	return (
		<>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_NORMAL_ACTIVITY")}
				note={Strings.get("SETTINGS_NORMAL_ACTIVITY_NOTE")}
				value={settingsState.normalActivityIcons}
				onChange={(v: boolean) => {
					Settings.set("normalActivityIcons", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_RICH_PRESENCE")}
				note={Strings.get("SETTINGS_RICH_PRESENCE_NOTE")}
				value={settingsState.richPresenceIcons}
				onChange={(v: boolean) => {
					Settings.set("richPresenceIcons", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_PLATFORM")}
				note={Strings.get("SETTINGS_PLATFORM_NOTE")}
				value={settingsState.platformIcons}
				onChange={(v: boolean) => {
					Settings.set("platformIcons", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_LISTENING")}
				note={Strings.get("SETTINGS_LISTENING_NOTE")}
				value={settingsState.listeningIcons}
				onChange={(v: boolean) => {
					Settings.set("listeningIcons", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_WATCHING")}
				note={Strings.get("SETTINGS_WATCHING_NOTE")}
				value={settingsState.watchingIcons}
				onChange={(v: boolean) => {
					Settings.set("watchingIcons", v);
				}}
			/>
		</>
	);
}
