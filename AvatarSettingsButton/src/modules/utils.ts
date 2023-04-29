import { createSettings, createStrings } from "@lib";
import locales from "../locales.json";

export const Settings = createSettings({
	showTooltip: true,
	click: 1,
	contextmenu: 3,
	middleclick: 2,
});

export const Strings = createStrings(locales, "en-US");
