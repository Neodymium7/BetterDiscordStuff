import { WebpackModules } from "@zlibrary";
import Settings from "bundlebd/settings";
import Strings from "bundlebd/strings";
import { useState } from "react";

const SwitchItem = WebpackModules.getByDisplayName("SwitchItem");

const SettingsSwitchItem = props => {
	const [value, setValue] = useState(Settings.get(props.setting));

	return (
		<SwitchItem
			children={props.name}
			note={props.note}
			value={value}
			onChange={v => {
				setValue(v);
				Settings.set(props.setting, v);
			}}
		/>
	);
};

export default function SettingsPanel() {
	const settings = {
		showMemberListIcons: {
			name: Strings.get("SETTINGS_ICONS"),
			note: Strings.get("SETTINGS_ICONS_NOTE")
		},
		showDMListIcons: {
			name: Strings.get("SETTINGS_DM_ICONS"),
			note: Strings.get("SETTINGS_DM_ICONS_NOTE")
		},
		showPeopleListIcons: {
			name: Strings.get("SETTINGS_PEOPLE_ICONS"),
			note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE")
		},
		currentChannelColor: {
			name: Strings.get("SETTINGS_COLOR"),
			note: Strings.get("SETTINGS_COLOR_NOTE")
		},
		ignoreEnabled: {
			name: Strings.get("SETTINGS_IGNORE"),
			note: Strings.get("SETTINGS_IGNORE_NOTE")
		}
	};

	return (
		<>
			{Object.keys(settings).map(key => {
				const { name, note } = settings[key];
				return <SettingsSwitchItem setting={key} name={name} note={note} />;
			})}
		</>
	);
}
