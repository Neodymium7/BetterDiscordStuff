import { Webpack } from "betterdiscord";
import { Settings, Strings } from "../utils";

const { getModule } = Webpack;

const SwitchItem = getModule((m) => m.toString?.().includes("().dividerDefault"), { searchExports: true });

export default function SettingsPanel() {
	return (
		<>
			<SwitchItem
				children={Strings.SETTINGS_EVERYONE}
				note={Strings.SETTINGS_EVERYONE_NOTE}
				value={Settings.everyone}
				onChange={(v: boolean) => {
					Settings.everyone = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_HERE}
				note={Strings.SETTINGS_HERE_NOTE}
				value={Settings.here}
				onChange={(v: boolean) => {
					Settings.here = v;
				}}
			/>
			<SwitchItem
				children={Strings.SETTINGS_ROLE_ICONS}
				note={Strings.SETTINGS_ROLE_ICONS_NOTE}
				value={Settings.showRoleIcons}
				onChange={(v: boolean) => {
					Settings.showRoleIcons = v;
				}}
			/>
		</>
	);
}
