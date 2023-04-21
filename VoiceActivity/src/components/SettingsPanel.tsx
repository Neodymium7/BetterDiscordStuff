import { SettingsKey } from "@lib";
import { SwitchItem } from "../modules/discordmodules";
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

const SettingsSwitchItem = (props: SwitchItemProps) => {
	const value = Settings.useSettingsState()[props.setting];

	return (
		<SwitchItem
			children={props.name}
			note={props.note}
			value={value}
			onChange={(v: typeof value) => {
				Settings[props.setting] = v;
			}}
		/>
	);
};

export default function SettingsPanel() {
	const settings: SettingsInfo = {
		showProfileSection: {
			name: Strings.SETTINGS_PROFILE,
			note: Strings.SETTINGS_PROFILE_NOTE,
		},
		showMemberListIcons: {
			name: Strings.SETTINGS_ICONS,
			note: Strings.SETTINGS_ICONS_NOTE,
		},
		showDMListIcons: {
			name: Strings.SETTINGS_DM_ICONS,
			note: Strings.SETTINGS_DM_ICONS_NOTE,
		},
		showPeopleListIcons: {
			name: Strings.SETTINGS_PEOPLE_ICONS,
			note: Strings.SETTINGS_PEOPLE_ICONS_NOTE,
		},
		showGuildIcons: {
			name: Strings.SETTINGS_GUILD_ICONS,
			note: Strings.SETTINGS_GUILD_ICONS_NOTE,
		},
		currentChannelColor: {
			name: Strings.SETTINGS_COLOR,
			note: Strings.SETTINGS_COLOR_NOTE,
		},
		showStatusIcons: {
			name: Strings.SETTINGS_STATUS,
			note: Strings.SETTINGS_STATUS_NOTE,
		},
		ignoreEnabled: {
			name: Strings.SETTINGS_IGNORE,
			note: Strings.SETTINGS_IGNORE_NOTE,
		},
	};

	return (
		<>
			{Object.keys(settings).map((key: SwitchSetting) => {
				const { name, note } = settings[key];
				return <SettingsSwitchItem setting={key} name={name} note={note} />;
			})}
		</>
	);
}
