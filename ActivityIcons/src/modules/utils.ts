import { ReactUtils, Utils } from "betterdiscord";
import { createSettings, createStrings } from "@lib";
import locales from "../locales.json";

export const Settings = createSettings({ voiceActivityIcons: true, normalActivityIcons: true, listeningIcons: true });

export const Strings = createStrings(locales, "en-US");

export function forceUpdateAll(selector: string, propsFilter = (_) => true) {
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

export function parseString(string: string, parseObject: Record<string, string>) {
	const delimiters = ["{{", "}}"];

	for (const key in parseObject) {
		string = string.replace(new RegExp(delimiters[0] + key + delimiters[1], "g"), parseObject[key]);
	}
	return string;
}

export function parseStringReact(string: string, parseObject: Record<string, React.ReactNode>) {
	const delimiters = ["{{", "}}"];
	const splitRegex = new RegExp(`(${delimiters[0]}.+?${delimiters[1]})`, "g");
	const itemRegex = new RegExp(delimiters[0] + "(.+)" + delimiters[1]);

	const parts = string.split(splitRegex).filter(Boolean);
	return parts.map((part) => {
		if (!itemRegex.test(part)) return part;
		const key = part.replace(itemRegex, "$1");
		return parseObject[key] ?? part;
	});
}
