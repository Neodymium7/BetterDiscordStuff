import { Common } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settingsState = Settings.useSettingsState();

	return (
		<>
			<Common.FormSwitch
				children={Strings.SETTINGS_EVERYONE}
				note={Strings.SETTINGS_EVERYONE_NOTE}
				value={settingsState.everyone}
				onChange={(v: boolean) => {
					Settings.everyone = v;
				}}
			/>
			<Common.FormSwitch
				children={Strings.SETTINGS_HERE}
				note={Strings.SETTINGS_HERE_NOTE}
				value={settingsState.here}
				onChange={(v: boolean) => {
					Settings.here = v;
				}}
			/>
			<Common.FormSwitch
				children={Strings.SETTINGS_ROLE_ICONS}
				note={Strings.SETTINGS_ROLE_ICONS_NOTE}
				value={settingsState.showRoleIcons}
				onChange={(v: boolean) => {
					Settings.showRoleIcons = v;
				}}
			/>
		</>
	);
}
