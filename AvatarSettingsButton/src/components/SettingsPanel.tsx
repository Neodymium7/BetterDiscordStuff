import { Webpack } from "betterdiscord";
import { Settings, Strings } from "../utils";

const {
	getModule,
	Filters: { byProps },
} = Webpack;

const Margins = getModule(byProps("marginXSmall"));
const RadioGroup = getModule((m) => m.Sizes && m.toString().includes("radioItemClassName"), { searchExports: true });
const SwitchItem = getModule((m) => m.toString?.().includes("().dividerDefault"), { searchExports: true });
const SettingsItem = getModule((m) => m.render?.toString().includes("required"), { searchExports: true });
const SettingsNote = getModule((m) => m.Types && m.toString().includes("selectable"), { searchExports: true });
const SettingsDivider = getModule((m) => m.toString?.().includes("().divider") && m.toString().includes("style"), {
	searchExports: true,
});

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
