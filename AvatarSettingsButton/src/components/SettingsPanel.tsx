import { Components } from "betterdiscord";
import { Settings, Strings } from "../modules/utils";
import { SettingsKey } from "@lib";

type SwitchSetting = SettingsKey<typeof Settings, boolean>;
type RadioSetting = SettingsKey<typeof Settings, number>;

interface SwitchItemProps {
	setting: SwitchSetting;
	name: string;
	note: string;
}

interface RadioItemProps {
	setting: RadioSetting;
	name: string;
	note: string;
	options: { name: string; value: number }[];
}

const SwitchItem: React.FunctionComponent<SwitchItemProps> = (props) => {
	const value = Settings.useSettingsState(props.setting)[props.setting];

	return (
		<Components.SettingItem id={props.setting} name={props.name} note={props.note} inline>
			<Components.SwitchInput
				id={props.setting}
				value={value}
				onChange={(v: typeof value) => {
					Settings.set(props.setting, v);
				}}
			/>
		</Components.SettingItem>
	);
};

const RadioItem: React.FunctionComponent<RadioItemProps> = (props) => {
	const value = Settings.useSettingsState(props.setting)[props.setting];

	return (
		<Components.SettingItem name={props.name} note={props.note} id={props.setting}>
			<Components.RadioInput
				name={props.name}
				options={props.options}
				onChange={(v: typeof value) => Settings.set(props.setting, v)}
				value={value}
			/>
		</Components.SettingItem>
	);
};

export default function SettingsPanel() {
	return (
		<>
			<RadioItem
				name={Strings.get("SETTINGS_CLICK")}
				note={Strings.get("SETTINGS_CLICK_NOTE")}
				setting="click"
				options={[
					{
						name: `${Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS")} (${Strings.get("DEFAULT")})`,
						value: 1,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				]}
			/>
			<RadioItem
				name={Strings.get("SETTINGS_RIGHT_CLICK")}
				note={Strings.get("SETTINGS_RIGHT_CLICK_NOTE")}
				setting="contextmenu"
				options={[
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_STATUS_PICKER")} (${Strings.get("DEFAULT")})`,
						value: 3,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				]}
			/>
			<RadioItem
				name={Strings.get("SETTINGS_MIDDLE_CLICK")}
				note={Strings.get("SETTINGS_MIDDLE_CLICK_NOTE")}
				setting="middleclick"
				options={[
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU")} (${Strings.get("DEFAULT")})`,
						value: 2,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				]}
			/>
			<SwitchItem
				name={Strings.get("SETTINGS_TOOLTIP")}
				note={Strings.get("SETTINGS_TOOLTIP_NOTE")}
				setting="showTooltip"
			/>
		</>
	);
}
