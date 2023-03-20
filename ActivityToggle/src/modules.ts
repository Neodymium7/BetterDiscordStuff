import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";
import React from "react";

const {
	Filters: { byProps, byStrings },
} = Webpack;

const { expectModule } = WebpackUtils;

export const { withTagAsButton } = expectModule(byProps("withTagAsButton"), {
	name: "Account Classes",
	fallback: {
		withTagAsButton: "unknown-class",
	},
});

export const Sections = expectModule(byProps("ACCOUNT"), {
	searchExports: true,
	name: "Sections",
	fallback: {
		ACTIVITY_PRIVACY: "Activity Privacy",
	},
});

export const PanelButton: React.FunctionComponent<any> = expectModule(byStrings("PANEL_BUTTON"), {
	name: "PanelButton",
	fatal: true,
});

export const Activity = expectModule(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"), {
	name: "Activity",
	fallback: () => null,
});

export const Settings = expectModule(byStrings("M14 7V9C14 9 12.5867 9"), { name: "Settings", fallback: () => null });

export const playSound: (id: string, vol: number) => void = expectModule(byStrings(".getSoundpack()"), {
	searchExports: true,
	name: "playSound",
});

export const { useSetting, updateSetting } = expectModule((m) => Object.values(m).some((e: any) => e?.useSetting), {
	name: "ActivitySettingManager",
	fallback: {
		G6: {
			useSetting: () => React.useState(true),
			updateSetting: undefined as (...args: any) => void,
		},
	},
}).G6;

export const UserSettingsWindow: any = expectModule(byProps("open", "updateAccount"), { name: "UserSettingsWindow" });
