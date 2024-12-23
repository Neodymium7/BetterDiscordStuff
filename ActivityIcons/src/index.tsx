import { DOM, Patcher, Meta, Plugin, Changes } from "betterdiscord";
import { showChangelog } from "@lib";
import {
	ActivityStatus,
	memberSelector,
	peopleListItemSelector,
	privateChannelSelector,
} from "./modules/discordmodules";
import { changelog } from "./manifest.json";
import { Strings, forceUpdateAll } from "./modules/utils";
import styles from "./styles.css";
import ActivityIcon from "./components/ActivityIcon";
import ListeningIcon from "./components/ListeningIcon";
import SettingsPanel from "./components/SettingsPanel";
import WatchingIcon from "./components/WatchingIcon";

export default class ActivityIcons implements Plugin {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
		DOM.addStyle(styles);
		Strings.subscribe();
		this.patchActivityStatus();
	}

	patchActivityStatus() {
		if (!ActivityStatus) return;
		const [module, key] = ActivityStatus;
		Patcher.after(module, key, (_, [props], ret) => {
			if (!ret) return;

			const defaultIconIndex = ret.props.children.findIndex((element: any) =>
				element?.props?.className?.startsWith("icon")
			);

			if (defaultIconIndex !== -1) {
				ret.props.children[defaultIconIndex] = null;
			}

			ret.props.children.push(
				<ActivityIcon activities={props.activities} />,
				<WatchingIcon activities={props.activities} />,
				<ListeningIcon activities={props.activities} />
			);
		});
		this.forceUpdateComponents();
	}

	forceUpdateComponents() {
		if (memberSelector) forceUpdateAll(memberSelector, (i) => i.user);
		if (peopleListItemSelector) forceUpdateAll(peopleListItemSelector, (i) => i.user);
		if (privateChannelSelector) forceUpdateAll(privateChannelSelector);
	}

	stop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
		Strings.unsubscribe();
		this.forceUpdateComponents();
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
