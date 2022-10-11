import { ReactTools } from "zlibrary";
import { SettingsManager } from "bundlebd";

export const Settings = new SettingsManager({ normalIconBehavior: 0 });

export const withProps = (filter: (m: any) => boolean) => {
	return (m) => Object.values(m).some(filter);
};

export function forceUpdateAll(selector: string) {
	document.querySelectorAll(selector).forEach((node) => {
		ReactTools.getStateNodes(node as HTMLElement).forEach((e) => e.forceUpdate());
	});
}
