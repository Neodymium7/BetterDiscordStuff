import { DOM, Patcher } from "betterdiscord";
import { DiscordSelectors } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import { ActivityStatus, peopleListItemSelector, privateChannelScrollerSelector } from "./modules/discordmodules";
import { Strings, forceUpdateAll } from "./modules/utils";
import styles from "./styles.css";
import ActivityIcon from "./components/ActivityIcon";
import ListeningIcon from "./components/ListeningIcon";
import SettingsPanel from "./components/SettingsPanel";

const memberListItem = `${DiscordSelectors.MemberList.members} > div > div:not(:first-child)`;
const privateChannelSelector = `${privateChannelScrollerSelector} > ul > li`;

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
		forceUpdateAll(peopleListItemSelector);
		forceUpdateAll(privateChannelSelector);
	}

	onStop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
		Strings.unsubscribe();
		forceUpdateAll(memberListItem);
		forceUpdateAll(peopleListItemSelector);
		forceUpdateAll(privateChannelSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
