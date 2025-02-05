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
				name={Strings.get("SETTINGS_NORMAL_ACTIVITY")}
				note={Strings.get("SETTINGS_NORMAL_ACTIVITY_NOTE")}
				setting={"normalActivityIcons"}
			/>
			<SwitchItem
				name={Strings.get("SETTINGS_RICH_PRESENCE")}
				note={Strings.get("SETTINGS_RICH_PRESENCE_NOTE")}
				setting={"richPresenceIcons"}
			/>
			<SwitchItem
				name={Strings.get("SETTINGS_PLATFORM")}
				note={Strings.get("SETTINGS_PLATFORM_NOTE")}
				setting={"platformIcons"}
			/>
			<SwitchItem
				name={Strings.get("SETTINGS_LISTENING")}
				note={Strings.get("SETTINGS_LISTENING_NOTE")}
				setting={"listeningIcons"}
			/>
			<SwitchItem
				name={Strings.get("SETTINGS_WATCHING")}
				note={Strings.get("SETTINGS_WATCHING_NOTE")}
				setting={"watchingIcons"}
			/>
		</>
	);
}
