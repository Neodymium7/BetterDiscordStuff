import { SettingsManager, StringsManager } from "@lib";
import locales from "../locales.json";

export const Settings = new SettingsManager({
	showTooltip: true,
	hideSettingsButton: true,
	click: 1,
	contextmenu: 3,
	middleclick: 2,
});

export const Strings = new StringsManager(locales, "en-US");
