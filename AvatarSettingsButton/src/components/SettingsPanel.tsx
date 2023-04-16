import {
	Margins,
	RadioGroup,
	SettingsDivider,
	SettingsItem,
	SettingsNote,
	SwitchItem,
} from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

export default function SettingsPanel() {
	const settings = Settings.useSettingsState();

	return (
		<>
			<SettingsItem title={Strings.SETTINGS_CLICK}>
				<SettingsNote className={Margins.marginBottom8} type="description">
					{Strings.SETTINGS_CLICK_NOTE}
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: `${Strings.SETTINGS_OPTIONS_OPEN_SETTINGS} (${Strings.DEFAULT})`, value: 1 },
						{ name: Strings.SETTINGS_OPTIONS_CONTEXT_MENU, value: 2 },
						{ name: Strings.SETTINGS_OPTIONS_STATUS_PICKER, value: 3 },
						{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 },
					]}
					onChange={({ value }) => (Settings.click = value)}
					value={settings.click}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SettingsItem title={Strings.SETTINGS_RIGHT_CLICK} className={Margins.marginTop20}>
				<SettingsNote className={Margins.marginBottom8} type="description">
					{Strings.SETTINGS_RIGHT_CLICK_NOTE}
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: Strings.SETTINGS_OPTIONS_OPEN_SETTINGS, value: 1 },
						{ name: Strings.SETTINGS_OPTIONS_CONTEXT_MENU, value: 2 },
						{ name: `${Strings.SETTINGS_OPTIONS_STATUS_PICKER} (${Strings.DEFAULT})`, value: 3 },
						{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 },
					]}
					onChange={({ value }) => (Settings.contextmenu = value)}
					value={settings.contextmenu}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SettingsItem title={Strings.SETTINGS_MIDDLE_CLICK} className={Margins.marginTop20}>
				<SettingsNote className={Margins.marginBottom8} type="description">
					{Strings.SETTINGS_MIDDLE_CLICK_NOTE}
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: Strings.SETTINGS_OPTIONS_OPEN_SETTINGS, value: 1 },
						{ name: `${Strings.SETTINGS_OPTIONS_CONTEXT_MENU} (${Strings.DEFAULT})`, value: 2 },
						{ name: Strings.SETTINGS_OPTIONS_STATUS_PICKER, value: 3 },
						{ name: Strings.SETTINGS_OPTIONS_NOTHING, value: 0 },
					]}
					onChange={({ value }) => (Settings.middleclick = value)}
					value={settings.middleclick}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SwitchItem
				className={Margins.marginTop20}
				children={Strings.SETTINGS_TOOLTIP}
				note={Strings.SETTINGS_TOOLTIP_NOTE}
				onChange={(v: boolean) => (Settings.showTooltip = v)}
				value={settings.showTooltip}
				hideBorder={true}
			/>
		</>
	);
}
