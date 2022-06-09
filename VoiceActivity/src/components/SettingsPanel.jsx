import createUpdateWrapper from "common/hooks/createUpdateWrapper";
import { WebpackModules } from "@zlibrary";
import Settings from "../modules/settings";
import Strings from "../modules/strings";

const SwitchItem = createUpdateWrapper(WebpackModules.getByDisplayName("SwitchItem"));

const settings = {
	showMemberListIcons: {
		name: Strings.get("SETTINGS_ICONS"),
		value: true,
		note: Strings.get("SETTINGS_ICONS_NOTE")
	},
	showDMListIcons: {
		name: Strings.get("SETTINGS_DM_ICONS"),
		value: false,
		note: Strings.get("SETTINGS_DM_ICONS_NOTE")
	},
	showPeopleListIcons: {
		name: Strings.get("SETTINGS_PEOPLE_ICONS"),
		value: false,
		note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE")
	},
	currentChannelColor: {
		name: Strings.get("SETTINGS_COLOR"),
		value: true,
		note: Strings.get("SETTINGS_COLOR_NOTE")
	},
	ignoreEnabled: {
		name: Strings.get("SETTINGS_IGNORE"),
		value: false,
		note: Strings.get("SETTINGS_IGNORE_NOTE")
	}
};

export default function SettingsPanel() {
	return (
		<>
			{Object.keys(settings).map(key => {
				const { name, value, note } = settings[key];
				return <SwitchItem children={name} note={note} value={Settings.get(key, value)} onChange={v => Settings.set(key, v)} />;
			})}
		</>
	);
}
