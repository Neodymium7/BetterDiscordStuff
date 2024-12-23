import { ReactUtils, Utils } from "betterdiscord";
import { SettingsManager, StringsManager } from "@lib";
import locales from "../locales.json";

export const Settings = new SettingsManager({
	normalActivityIcons: true,
	richPresenceIcons: true,
	platformIcons: true,
	listeningIcons: true,
	watchingIcons: true,
});

export const Strings = new StringsManager(locales, "en-US");

export function forceUpdateAll(selector: string, propsFilter = (_: any) => true) {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);
	for (const element of elements) {
		const instance = ReactUtils.getInternalInstance(element);
		const stateNode = Utils.findInTree(
			instance,
			(n) => n?.stateNode?.forceUpdate && propsFilter(n.stateNode.props),
			{ walkable: ["return"] }
		).stateNode;
		stateNode.forceUpdate();
	}
}

const botActivityKeys = ["created_at", "id", "name", "type", "url"];

export function isBot(activities: any[]) {
	return activities.length === 1 && Object.keys(activities[0]).every((value, i) => value === botActivityKeys[i]);
}
