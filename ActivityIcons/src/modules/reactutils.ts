import { ReactTools } from "zlibrary";

export function forceUpdateAll(selector: string) {
	document.querySelectorAll(selector).forEach((node) => {
		ReactTools.getStateNodes(node as HTMLElement).forEach((e) => e.forceUpdate());
	});
}
