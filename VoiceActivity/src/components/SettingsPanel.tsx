import { SettingsKey } from "@lib";
import { Settings, Strings } from "../modules/utils";
import { Components } from "betterdiscord";

type SwitchSetting = SettingsKey<typeof Settings, boolean>;

interface SwitchItemProps {
	setting: SwitchSetting;
	name: string;
	note: string;
}

type SettingsInfo = {
	[K in SwitchSetting]: {
		name: string;
		note: string;
	};
};

const settings: SettingsInfo = {
	showProfileSection: {
		name: Strings.get("SETTINGS_PROFILE"),
		note: Strings.get("SETTINGS_PROFILE_NOTE"),
	},
	showMemberListIcons: {
		name: Strings.get("SETTINGS_ICONS"),
		note: Strings.get("SETTINGS_ICONS_NOTE"),
	},
	showDMListIcons: {
		name: Strings.get("SETTINGS_DM_ICONS"),
		note: Strings.get("SETTINGS_DM_ICONS_NOTE"),
	},
	showPeopleListIcons: {
		name: Strings.get("SETTINGS_PEOPLE_ICONS"),
		note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE"),
	},
	showGuildIcons: {
		name: Strings.get("SETTINGS_GUILD_ICONS"),
		note: Strings.get("SETTINGS_GUILD_ICONS_NOTE"),
	},
	currentChannelColor: {
		name: Strings.get("SETTINGS_COLOR"),
		note: Strings.get("SETTINGS_COLOR_NOTE"),
	},
	showStatusIcons: {
		name: Strings.get("SETTINGS_STATUS"),
		note: Strings.get("SETTINGS_STATUS_NOTE"),
	},
	ignoreEnabled: {
		name: Strings.get("SETTINGS_IGNORE"),
		note: Strings.get("SETTINGS_IGNORE_NOTE"),
	},
};

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
			{(Object.keys(settings) as SwitchSetting[]).map((key) => {
				const { name, note } = settings[key];
				return <SwitchItem setting={key} name={name} note={note} />;
			})}
		</>
	);
}
