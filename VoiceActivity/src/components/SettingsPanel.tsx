import { SettingsKey } from "@lib";
import { Common } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

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

const SettingsSwitchItem = (props: SwitchItemProps) => {
	const value = Settings.useSettingsState(props.setting)[props.setting];

	return (
		<Common.FormSwitch
			children={props.name}
			note={props.note}
			value={value}
			onChange={(v: typeof value) => {
				Settings.set(props.setting, v);
			}}
		/>
	);
};

export default function SettingsPanel() {
	return (
		<>
			{Object.keys(settings).map((key: SwitchSetting) => {
				const { name, note } = settings[key];
				return <SettingsSwitchItem setting={key} name={name} note={note} />;
			})}
		</>
	);
}
