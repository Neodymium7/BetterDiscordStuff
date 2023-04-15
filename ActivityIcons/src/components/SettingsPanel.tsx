import Settings from "../modules/settings";
import Strings from "../modules/strings";
import { SettingsItem, SettingsNote, RadioGroup, Margins } from "../modules/discordmodules";

export default function SettingsPanel() {
	const settings = Settings.useSettingsState();

	return (
		<SettingsItem title={Strings.SETTINGS_ICON_BEHAVIOR}>
			<SettingsNote className={Margins.marginBottom8} type="description">
				{Strings.SETTINGS_ICON_BEHAVIOR_NOTE}
			</SettingsNote>
			<RadioGroup
				options={[
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_ACTIVITY, value: 0 },
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_STATUS_AND_ACTIVITY, value: 1 },
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_NEVER, value: 2 },
				]}
				onChange={({ value }) => (Settings.normalIconBehavior = value)}
				value={settings.normalIconBehavior}
			/>
		</SettingsItem>
	);
}
