import { Patcher, DOM, Webpack, ContextMenu } from "betterdiscord";
import { WebpackUtils } from "bundlebd";
import { ReactComponents, Utilities } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import styles from "styles";
import { Settings, Strings, forceUpdateAll } from "./utils";
import iconStyles from "./styles/voiceicon.module.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoicePopoutSection from "./components/VoicePopoutSection";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byProps, byStrings },
	getModule,
} = Webpack;

const { byValues } = WebpackUtils;

const memberItemSelector = `.${getModule(byProps("member", "activity")).member}`;
const privateChannelSelector = `.${getModule(byProps("channel", "activity")).channel}`;
const peopleItemSelector = `.${getModule(byProps("peopleListItem")).peopleListItem}`;
const children = getModule(byProps("avatar", "children")).children;

export default class VoiceActivity extends BasePlugin {
	contextMenuUnpatches: Set<() => void>;

	onStart() {
		this.contextMenuUnpatches = new Set();

		DOM.addStyle(styles() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`);
		Strings.subscribe();
		this.patchUserPopout();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}

	patchUserPopout() {
		const UserPopoutBody = getModule(byValues(byStrings(".showCopiableUsername")));
		Patcher.after(UserPopoutBody, "Z", (_, [props]: [any], ret) => {
			const popoutSections = ret.props.children[1].props.children[2].props.children;
			const activitySectionIndex = popoutSections.findIndex((section: any) =>
				section.props.hasOwnProperty("activity")
			);
			popoutSections.splice(activitySectionIndex, 0, <VoicePopoutSection userId={props.user.id} />);
		});
	}

	async patchMemberListItem() {
		const MemberListItem = await ReactComponents.getComponent(
			"MemberListItem",
			memberItemSelector,
			(c) => c.prototype?.renderPremium
		);
		Patcher.after(MemberListItem.component.prototype, "render", (thisObject: any, _, ret) => {
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
		Patcher.after(PrivateChannel.component.prototype, "render", (thisObject: any, _, ret) => {
			if (!thisObject.props.user) return;
			const props = Utilities.findInTree(ret, (e) => e?.children && e?.id, { walkable: ["children", "props"] });
			const children = props.children;
			props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				const privateChannel = Utilities.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
					walkable: ["children", "props"],
				});
				privateChannel.children = [
					privateChannel.children,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={thisObject.props.user.id} context="dmlist" />
					</div>,
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
		Patcher.after(PeopleListItem.component.prototype, "render", (thisObject: any, _, ret) => {
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
			if (!Settings.ignoreEnabled) return ret;

			const { ignoredChannels } = Settings.useSettingsState();
			const ignored = ignoredChannels.includes(props.channel.id);
			const menuItem = ContextMenu.buildItem({
				type: "toggle",
				label: Strings.CONTEXT_IGNORE,
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredChannels = ignoredChannels.filter((id) => id !== props.channel.id);
						Settings.ignoredChannels = newIgnoredChannels;
					} else {
						const newIgnoredChannels = [...ignoredChannels, props.channel.id];
						Settings.ignoredChannels = newIgnoredChannels;
					}
				},
			});

			ret.props.children[3].props.children.splice(2, 0, menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	async patchGuildContextMenu() {
		const unpatch = ContextMenu.patch("guild-context", (ret, props) => {
			if (!Settings.ignoreEnabled) return ret;

			const { ignoredGuilds } = Settings.useSettingsState();
			const ignored = ignoredGuilds.includes(props.guild.id);
			const menuItem = ContextMenu.buildItem({
				type: "toggle",
				label: Strings.CONTEXT_IGNORE,
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredGuilds = ignoredGuilds.filter((id) => id !== props.guild.id);
						Settings.ignoredGuilds = newIgnoredGuilds;
					} else {
						const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
						Settings.ignoredGuilds = newIgnoredGuilds;
					}
				},
			});

			ret.props.children[2].props.children.push(menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	onStop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
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
