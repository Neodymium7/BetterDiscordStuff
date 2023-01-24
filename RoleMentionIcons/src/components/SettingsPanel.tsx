import { Webpack } from "betterdiscord";
import { Settings } from "../utils";

const { getModule } = Webpack;

const SwitchItem = getModule((m) => m.toString?.().includes("().dividerDefault"), { searchExports: true });

export default function SettingsPanel() {
	return (
		<>
			<SwitchItem
				children="@everyone"
				note='Shows icons on "@everyone" mentions.'
				value={Settings.everyone}
				onChange={(v: boolean) => {
					Settings.everyone = v;
				}}
			/>
			<SwitchItem
				children="@here"
				note='Shows icons on "@here" mentions.'
				value={Settings.here}
				onChange={(v: boolean) => {
					Settings.here = v;
				}}
			/>
			<SwitchItem
				children="Role Icons"
				note="Shows Role Icons instead of default icon when applicable."
				value={Settings.showRoleIcons}
				onChange={(v: boolean) => {
					Settings.showRoleIcons = v;
				}}
			/>
		</>
	);
}
