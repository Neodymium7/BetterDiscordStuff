import { Patcher, Webpack, injectCSS, clearCSS } from "betterdiscord";
import { DiscordSelectors } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import { forceUpdateAll, withProps } from "./utils";
import styles from "./styles.css";
import ActivityIcon from "./components/ActivityIcon";
import ListeningIcon from "./components/ListeningIcon";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byProps, byStrings },
	getModule
} = Webpack;

const peopleListItem = `.${getModule(byProps("peopleListItem")).peopleListItem}`;
const memberListItem = `${DiscordSelectors.MemberList.members} > div > div:not(:first-child)`;
const privateChannel = `.${getModule(byProps("privateChannelsHeaderContainer")).scroller} > ul > li`;

export default class ActivityIcons extends BasePlugin {
	onStart() {
		injectCSS("ActivityIcons", styles);
		this.patchActivityStatus();
	}

	patchActivityStatus() {
		const ActivityStatus = getModule(withProps(byStrings("applicationStream")));
		Patcher.after("ActivityIcons", ActivityStatus, "Z", (_, [props], ret) => {
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
		Patcher.unpatchAll("ActivityIcons");
		clearCSS("ActivityIcons");
		forceUpdateAll(memberListItem);
		forceUpdateAll(peopleListItem);
		forceUpdateAll(privateChannel);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
