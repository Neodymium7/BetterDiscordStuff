import { Common } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settingsState = Settings.useSettingsState();

	return (
		<>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_EVERYONE")}
				note={Strings.get("SETTINGS_EVERYONE_NOTE")}
				value={settingsState.everyone}
				onChange={(v: boolean) => {
					Settings.set("everyone", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_HERE")}
				note={Strings.get("SETTINGS_HERE_NOTE")}
				value={settingsState.here}
				onChange={(v: boolean) => {
					Settings.set("here", v);
				}}
			/>
			<Common.FormSwitch
				children={Strings.get("SETTINGS_ROLE_ICONS")}
				note={Strings.get("SETTINGS_ROLE_ICONS_NOTE")}
				value={settingsState.showRoleIcons}
				onChange={(v: boolean) => {
					Settings.set("showRoleIcons", v);
				}}
			/>
		</>
	);
}
