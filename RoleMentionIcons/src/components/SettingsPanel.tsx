import { SettingsKey } from "@lib";
import { Settings, Strings } from "../modules/utils";
import { Components } from "betterdiscord";

type SwitchSetting = SettingsKey<typeof Settings, boolean>;

interface SwitchItemProps {
	setting: SwitchSetting;
	name: string;
	note: string;
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

export default function SettingsPanel() {
	return (
		<>
			<SwitchItem
				name={Strings.get("SETTINGS_EVERYONE")}
				note={Strings.get("SETTINGS_EVERYONE_NOTE")}
				setting={"everyone"}
			/>
			<SwitchItem name={Strings.get("SETTINGS_HERE")} note={Strings.get("SETTINGS_HERE_NOTE")} setting={"here"} />
			<SwitchItem
				name={Strings.get("SETTINGS_ROLE_ICONS")}
				note={Strings.get("SETTINGS_ROLE_ICONS_NOTE")}
				setting={"showRoleIcons"}
			/>
		</>
	);
}
