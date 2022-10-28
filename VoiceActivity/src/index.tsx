import { Patcher, clearCSS, injectCSS, Webpack, ContextMenu } from "betterdiscord";
import { ReactComponents, Utilities } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import styles from "styles";
import { Settings, Strings, forceUpdateAll, withProps } from "./utils";
import iconStyles from "./styles/voiceicon.scss?module";
import VoiceIcon from "./components/VoiceIcon";
import VoicePopoutSection from "./components/VoicePopoutSection";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byProps, byStrings },
	getModule
} = Webpack;

const memberItemSelector = `.${getModule(byProps("member", "activity")).member}`;
const privateChannelSelector = `.${getModule(byProps("channel", "activity")).channel}`;
const peopleItemSelector = `.${getModule(byProps("peopleListItem")).peopleListItem}`;
const children = getModule(byProps("avatar", "children")).children;

export default class VoiceActivity extends BasePlugin {
	contextMenuUnpatches: Set<() => void>;

	onStart() {
		this.contextMenuUnpatches = new Set();

		injectCSS(
			"VoiceActivity",
			styles() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`
		);
		Strings.subscribe();
		this.patchUserPopout();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}

	patchUserPopout() {
		const UserPopoutBody = getModule(withProps(byStrings(".showCopiableUsername")));
		Patcher.after("VoiceActivity", UserPopoutBody, "Z", (_, [props], ret) => {
			const popoutSections = ret.props.children[1].props.children[2].props.children;
			const activitySectionIndex = popoutSections.findIndex((section: any) => !!section.props.activity);
			popoutSections.splice(activitySectionIndex, 0, <VoicePopoutSection userId={props.user.id} />);
		});
	}

	async patchMemberListItem() {
		const MemberListItem = await ReactComponents.getComponent(
			"MemberListItem",
			memberItemSelector,
			(c) => c.prototype?.renderPremium
		);
		Patcher.after("VoiceActivity", MemberListItem.component.prototype, "render", (thisObject, _, ret) => {
			if (thisObject.props.user) {
				Array.isArray(ret.props.children)
					? ret.props.children.unshift(<VoiceIcon userId={thisObject.props.user.id} context="memberlist" />)
					: (ret.props.children = [<VoiceIcon userId={thisObject.props.user.id} context="memberlist" />]);
			}
		});
		forceUpdateAll(memberItemSelector);
	}

	async patchPrivateChannel() {
		const PrivateChannel = await ReactComponents.getComponent(
			"PrivateChannel",
			privateChannelSelector,
			(c) => c.prototype?.renderSubtitle
		);
		Patcher.after("VoiceActivity", PrivateChannel.component.prototype, "render", (thisObject, _, ret) => {
			if (!thisObject.props.user) return;
			const props = Utilities.findInTree(ret, (e) => e?.children && e?.id, { walkable: ["children", "props"] });
			const children = props.children;
			props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				const privateChannel = Utilities.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
					walkable: ["children", "props"]
				});
				privateChannel.children = [
					privateChannel.children,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={thisObject.props.user.id} context="dmlist" />
					</div>
				];
				return childrenRet;
			};
		});
		forceUpdateAll(privateChannelSelector);
	}

	async patchPeopleListItem() {
		const PeopleListItem = await ReactComponents.getComponent(
			"PeopleListItem",
			peopleItemSelector,
			(c) => c.prototype?.componentWillEnter
		);
		Patcher.after("VoiceActivity", PeopleListItem.component.prototype, "render", (thisObject, _, ret) => {
			if (!thisObject.props.user) return;
			const children = ret.props.children;
			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				childrenRet.props.children.props.children.props.children.splice(
					1,
					0,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={thisObject.props.user.id} context="peoplelist" />
					</div>
				);
				return childrenRet;
			};
		});
		forceUpdateAll(peopleItemSelector);
	}

	async patchChannelContextMenu() {
		const unpatch = ContextMenu.patch("channel-context", (ret, props) => {
			if (!Settings.get("ignoreEnabled")) return ret;

			const { ignoredChannels } = Settings.useSettingsState();
			const ignored = ignoredChannels.includes(props.channel.id);
			const menuItem = ContextMenu.buildItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredChannels = ignoredChannels.filter((id) => id !== props.channel.id);
						Settings.set("ignoredChannels", newIgnoredChannels);
					} else {
						const newIgnoredChannels = [...ignoredChannels, props.channel.id];
						Settings.set("ignoredChannels", newIgnoredChannels);
					}
				}
			});

			ret.props.children[3].props.children.splice(2, 0, menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	async patchGuildContextMenu() {
		const unpatch = ContextMenu.patch("guild-context", (ret, props) => {
			if (!Settings.get("ignoreEnabled")) return ret;

			const { ignoredGuilds } = Settings.useSettingsState();
			const ignored = ignoredGuilds.includes(props.guild.id);
			const menuItem = ContextMenu.buildItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredGuilds = ignoredGuilds.filter((id) => id !== props.guild.id);
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					} else {
						const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					}
				}
			});

			ret.props.children[2].props.children.push(menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	onStop() {
		clearCSS("VoiceActivity");
		Patcher.unpatchAll("VoiceActivity");
		Strings.unsubscribe();
		this.contextMenuUnpatches.forEach((unpatch) => unpatch());
		this.contextMenuUnpatches.clear();
		forceUpdateAll(memberItemSelector);
		forceUpdateAll(privateChannelSelector);
		forceUpdateAll(peopleItemSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
