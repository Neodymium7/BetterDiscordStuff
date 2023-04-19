import { ReactUtils, Utils } from "betterdiscord";
import { createSettings, createStrings } from "bundlebd";
import locales from "../locales.json";

export const Settings = createSettings({ normalIconBehavior: 0 });

export const Strings = createStrings(locales, "en-US");

export function forceUpdateAll(selector: string, propsFilter = (_) => true) {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);
	for (const element of elements) {
		const instance = ReactUtils.getInternalInstance(element);
		const stateNode = Utils.findInTree(
			instance,
			(n) => n && n.stateNode && n.stateNode.forceUpdate && propsFilter(n.stateNode.props),
			{ walkable: ["return"] }
		).stateNode;
		stateNode.forceUpdate();
	}
}
