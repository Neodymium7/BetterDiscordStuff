import { ReactTools } from "zlibrary";
import { createSettings } from "bundlebd";

export const Settings = createSettings({ normalIconBehavior: 0 });

export function forceUpdateAll(selector: string) {
	document.querySelectorAll(selector).forEach((node) => {
		ReactTools.getStateNodes(node as HTMLElement).forEach((e) => e.forceUpdate());
	});
}
