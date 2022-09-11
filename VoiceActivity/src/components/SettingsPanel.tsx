import { Webpack } from "betterdiscord";
import { useState } from "react";
import { Settings, Strings } from "../utils";

const {
	Filters: { byDisplayName },
	getModule
} = Webpack;

type setting = typeof Settings.keys[number];

interface SwitchItemProps {
	setting: setting;
	name: string;
	note: string;
}

const SwitchItem = getModule(byDisplayName("SwitchItem"));

const SettingsSwitchItem = (props: SwitchItemProps) => {
	const [value, setValue] = useState(Settings.get(props.setting));

	return (
		<SwitchItem
			children={props.name}
			note={props.note}
			value={value}
			onChange={(v: typeof value) => {
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
			{Object.keys(settings).map((key: setting) => {
				const { name, note } = settings[key];
				return <SettingsSwitchItem setting={key} name={name} note={note} />;
			})}
		</>
	);
}
