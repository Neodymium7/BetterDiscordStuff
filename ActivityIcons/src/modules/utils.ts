import { ReactTools } from "zlibrary";
import { createSettings, createStrings } from "bundlebd";
import locales from "../locales.json";

export const Settings = createSettings({ normalIconBehavior: 0 });

export const Strings = createStrings(locales, "en-US");

export function forceUpdateAll(selector: string) {
	document.querySelectorAll(selector).forEach((node) => {
		ReactTools.getStateNodes(node as HTMLElement).forEach((e) => e.forceUpdate());
	});
}
