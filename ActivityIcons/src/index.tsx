import { Patcher, DOM } from "betterdiscord";
import { DiscordSelectors } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import Strings from "./modules/strings";
import { forceUpdateAll } from "./modules/reactutils";
import { ActivityStatus, peopleListItem, privateChannel } from "./modules/discordmodules";
import styles from "./styles.css";
import ActivityIcon from "./components/ActivityIcon";
import ListeningIcon from "./components/ListeningIcon";
import SettingsPanel from "./components/SettingsPanel";

const memberListItem = `${DiscordSelectors.MemberList.members} > div > div:not(:first-child)`;

export default class ActivityIcons extends BasePlugin {
	onStart() {
		DOM.addStyle(styles);
		Strings.subscribe();
		this.patchActivityStatus();
	}

	patchActivityStatus() {
		Patcher.after(ActivityStatus, "Z", (_, [props]: [any], ret) => {
			if (ret) {
				ret.props.children[2] = null;
				ret.props.children.push(<ActivityIcon activities={props.activities} />);
				ret.props.children.push(<ListeningIcon activities={props.activities} />);
			}
		});
		forceUpdateAll(memberListItem);
		forceUpdateAll(peopleListItem);
		forceUpdateAll(privateChannel);
	}

	onStop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
		Strings.unsubscribe();
		forceUpdateAll(memberListItem);
		forceUpdateAll(peopleListItem);
		forceUpdateAll(privateChannel);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
