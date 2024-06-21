import { Webpack } from "betterdiscord";
import { expectModule, getSelectors, getIcon } from "@lib/utils/webpack";
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

export const Activity = getIcon(
	"Activity",
	"M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09"
);

export const Settings = getIcon("Settings", "M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53");

export const playSound: (id: string, vol: number) => void = expectModule({
	filter: byStrings("Unable to find sound for pack name:"),
	name: "playSound",
	searchExports: true,
});

export const ShowCurrentGame = expectModule({
	filter: (m) => Object.values(m).some((e: any) => e?.useSetting),
	name: "ShowCurrentGame",
	fallback: {
		G6: {
			useSetting: () => React.useState(true),
			updateSetting: undefined as (...args: any) => void,
		},
	},
})?.G6;

export const UserSettingsWindow: any = expectModule({
	filter: byKeys("open", "updateAccount"),
	name: "UserSettingsWindow",
});

export const AccountSelectors = getSelectors("Account Classes", [
	"avatarWrapper",
	"accountProfilePopoutWrapper",
	"container",
]);
