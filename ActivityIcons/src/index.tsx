import { DOM, Patcher } from "betterdiscord";
import BasePlugin from "zlibrary/plugin";
import {
	ActivityStatus,
	memberSelector,
	peopleListItemSelector,
	privateChannelSelector,
} from "./modules/discordmodules";
import { Strings, forceUpdateAll } from "./modules/utils";
import styles from "./styles.css";
import ActivityIcon from "./components/ActivityIcon";
import ListeningIcon from "./components/ListeningIcon";
import SettingsPanel from "./components/SettingsPanel";
import WatchingIcon from "./components/WatchingIcon";

export default class ActivityIcons extends BasePlugin {
	onStart() {
		DOM.addStyle(styles);
		Strings.subscribe();
		this.patchActivityStatus();
	}

	patchActivityStatus() {
		Patcher.after(ActivityStatus, "default", (_, [props]: [any], ret) => {
			if (!ret) return;
			ret.props.children[2] = null;
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

	onStop() {
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
