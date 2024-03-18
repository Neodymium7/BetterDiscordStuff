import { Webpack } from "betterdiscord";
import { expectModule, getSelectors, getClasses, getIcon } from "@lib/utils/webpack";
import React from "react";

const {
	Filters: { byKeys, byStrings },
} = Webpack;

export const Sections = expectModule(byKeys("ACCOUNT", "ACCESSIBILITY"), {
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

export const Sounds: {
	playSound: (id: string, vol: number) => void;
} = expectModule({
	filter: byKeys("playSound", "createSound"),
	name: "Sounds",
});

export const ShowCurrentGame = expectModule({
	filter: byKeys("ShowCurrentGame"),
	name: "ShowCurrentGame",
	fallback: {
		ShowCurrentGame: {
			useSetting: () => React.useState(true),
			updateSetting: undefined as (...args: any) => void,
		},
	},
})?.ShowCurrentGame;

export const UserSettingsWindow: any = expectModule({
	filter: byKeys("open", "updateAccount"),
	name: "UserSettingsWindow",
});

export const AccountSelectors = getSelectors("Account Classes", ["withTagAsButton", "container"]);
export const AccountClasses = getClasses("Account Classes", ["withTagAsButton", "strikethrough"]);
