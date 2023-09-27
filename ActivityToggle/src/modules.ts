import { Webpack } from "betterdiscord";
import { expectModule, getSelectors, getClasses, getIcon } from "@lib/utils/webpack";
import React from "react";

const {
	Filters: { byProps, byStrings },
} = Webpack;

export const Sections = expectModule(byProps("ACCOUNT"), {
	searchExports: true,
	name: "Sections",
	fallback: {
		ACTIVITY_PRIVACY: "Activity Privacy",
	},
});

export const PanelButton: React.FunctionComponent<any> = expectModule({
	filter: byStrings("PANEL_BUTTON"),
	name: "PanelButton",
	fatal: true,
});

export const Activity = getIcon("Activity", "M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264");

export const Settings = getIcon("Settings", "M14 7V9C14 9 12.5867 9");
export const playSound: (id: string, vol: number) => void = expectModule({
	filter: byStrings(".getSoundpack()"),
	searchExports: true,
	name: "playSound",
});

export const { useSetting, updateSetting } = expectModule({
	filter: (m) => Object.values(m).some((e: any) => e?.useSetting),
	name: "ActivitySettingManager",
	fallback: {
		G6: {
			useSetting: () => React.useState(true),
			updateSetting: undefined as (...args: any) => void,
		},
	},
}).G6;

export const UserSettingsWindow: any = expectModule({
	filter: byProps("open", "updateAccount"),
	name: "UserSettingsWindow",
});

export const AccountSelectors = getSelectors("Account Classes", ["withTagAsButton", "container"]);
export const AccountClasses = getClasses("Account Classes", ["withTagAsButton", "strikethrough"]);
