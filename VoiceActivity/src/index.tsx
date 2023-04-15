import { Patcher, DOM, Webpack, ContextMenu, ReactUtils, Utils } from "betterdiscord";
import { WebpackUtils } from "bundlebd";
import { ReactComponents } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import styles from "styles";
import { Settings, Strings, forceUpdateAll, forceRerender, getGuildMediaState } from "./modules/utils";
import iconStyles from "./styles/voiceicon.module.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoiceProfileSection from "./components/VoiceProfileSection";
import SettingsPanel from "./components/SettingsPanel";
import {
	VoiceStateStore,
	children,
	guildIconClass,
	memberItemClass,
	peopleItemClass,
	privateChannelClass,
	useStateFromStores,
} from "./modules/discordmodules";

const {
	Filters: { byStrings },
} = Webpack;

const { getModuleWithKey } = WebpackUtils;

const memberItemSelector = `.${memberItemClass}`;
const privateChannelSelector = `.${privateChannelClass}`;
const peopleItemSelector = `.${peopleItemClass}`;
const guildIconSelector = `.${guildIconClass}`;

export default class VoiceActivity extends BasePlugin {
	contextMenuUnpatches: Set<() => void>;

	onStart() {
		this.contextMenuUnpatches = new Set();

		DOM.addStyle(styles() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`);
		Strings.subscribe();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchUserPopout();
		this.patchPrivateChannelProfile();
		this.patchGuildIcon();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}

	patchUserPopout() {
		const [UserPopoutBody, key] = getModuleWithKey(byStrings(".showCopiableUsername"));
		Patcher.after(UserPopoutBody, key, (_, [props]: [any], ret) => {
			const popoutSections = Utils.findInTree(ret, (i) => i.onScroll, {
				walkable: ["props", "children"],
			})?.children;
			const activitySectionIndex = popoutSections.findIndex((section: any) =>
				section.props.hasOwnProperty("activity")
			);
			popoutSections.splice(activitySectionIndex, 0, <VoiceProfileSection userId={props.user.id} />);
		});
	}

	patchPrivateChannelProfile() {
		const [PrivateChannelProfile, key] = getModuleWithKey((m) => m.Inner);
		const { Inner } = PrivateChannelProfile[key];
		Patcher.after(PrivateChannelProfile, key, (_, [props]: [any], ret) => {
			if (props.profileType !== 3) return ret;
			const sections = Utils.findInTree(ret, (i) => Array.isArray(i), {
				walkable: ["props", "children"],
			});
			sections.splice(2, 0, <VoiceProfileSection userId={props.user.id} wrapper={Inner} />);
		});
	}

	patchGuildIcon() {
		const element: HTMLElement = document.querySelector(guildIconSelector);
		if (!element) return;
		const targetInstance = Utils.findInTree(
			ReactUtils.getInternalInstance(element),
			(n) => n?.elementType?.type && n.pendingProps?.mediaState,
			{ walkable: ["return"] }
		);
		Patcher.before(targetInstance.elementType, "type", (_, [props]: [any]) => {
			const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState();
			const mediaState = useStateFromStores([VoiceStateStore], () =>
				getGuildMediaState(props.guild.id, ignoredChannels)
			);

			if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
				props.mediaState = { ...props.mediaState, ...mediaState };
			} else if (!props.mediaState.participating) {
				props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
			}
		});
		forceRerender(guildIconSelector);
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
			const props = Utils.findInTree(ret, (e) => e?.children && e?.id, { walkable: ["children", "props"] });
			const children = props.children;
			props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				const privateChannel = Utils.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
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
				Utils.findInTree(childrenRet, (i) => Array.isArray(i), { walkable: ["props", "children"] }).splice(
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

	patchChannelContextMenu() {
		const unpatch = ContextMenu.patch("channel-context", (ret, props) => {
			if (!Settings.ignoreEnabled) return ret;
			if (props.channel.type !== 2 && props.channel.type !== 13) return ret;

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

	patchGuildContextMenu() {
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
		forceRerender(guildIconSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
