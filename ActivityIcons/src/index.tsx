import { DOM, Patcher, Meta } from "betterdiscord";
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

export default class ActivityIcons {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog, this.meta);
		DOM.addStyle(styles);
		Strings.subscribe();
		this.patchActivityStatus();
	}

	patchActivityStatus() {
		Patcher.after(ActivityStatus, "ZP", (_, [props]: [any], ret) => {
			if (!ret) return;

			const defaultIconIndex = ret.props.children.findIndex((element) =>
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
		forceUpdateAll(memberSelector, (i) => i.user);
		forceUpdateAll(peopleListItemSelector, (i) => i.user);
		forceUpdateAll(privateChannelSelector);
	}

	stop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
		Strings.unsubscribe();
		forceUpdateAll(memberSelector, (i) => i.user);
		forceUpdateAll(peopleListItemSelector, (i) => i.user);
		forceUpdateAll(privateChannelSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
