import { ContextMenu, DOM, Patcher, ReactUtils, Utils, Webpack } from "betterdiscord";
import { Logger, WebpackUtils } from "bundlebd";
import BasePlugin from "zlibrary/plugin";
import styles from "styles";
import {
	MemberListItemContainer,
	Stores,
	children,
	iconWrapperSelector,
	peopleItemSelector,
	useStateFromStores,
} from "./modules/discordmodules";
import { Settings, Strings, forceRerender, forceUpdateAll, getGuildMediaState, waitForElement } from "./modules/utils";
import iconStyles from "./styles/voiceicon.module.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoiceProfileSection from "./components/VoiceProfileSection";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byStrings },
} = Webpack;

const { getModuleWithKey } = WebpackUtils;

const guildIconSelector = `div:not([data-dnd-name]) + ${iconWrapperSelector}`;

export default class VoiceActivity extends BasePlugin {
	contextMenuUnpatches: Set<() => void>;

	onStart() {
		this.contextMenuUnpatches = new Set();

		DOM.addStyle(styles() + `${children}:empty { margin-left: 0; } ${children} { display: flex; gap: 8px; }`);
		Strings.subscribe();
		this.patchPeopleListItem();
		this.patchUserPopout();
		this.patchPrivateChannelProfile();
		this.patchMemberListItem();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
		this.patchPrivateChannel();
		this.patchGuildIcon();
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

	patchMemberListItem() {
		const unpatch = Patcher.after(MemberListItemContainer, "type", (_, _args, containerRet) => {
			const MemberListItem = containerRet.type;

			Patcher.after(MemberListItem.prototype, "render", (that: any, _, ret) => {
				if (!that.props.user) return ret;
				Array.isArray(ret.props.children)
					? ret.props.children.unshift(<VoiceIcon userId={that.props.user.id} context="memberlist" />)
					: (ret.props.children = [<VoiceIcon userId={that.props.user.id} context="memberlist" />]);
			});

			unpatch();
		});
	}

	patchPrivateChannel() {
		const [PrivateChannelContainer, key] = getModuleWithKey(byStrings("getRecipientId", "isFavorite"));
		const unpatch = Patcher.after(PrivateChannelContainer, key, (_, _args, containerRet) => {
			const PrivateChannel = containerRet.type;

			Patcher.after(PrivateChannel.prototype, "render", (that: any, _, ret) => {
				if (!that.props.user) return ret;
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
							<VoiceIcon userId={that.props.user.id} context="dmlist" />
						</div>,
					];
					return childrenRet;
				};
			});

			unpatch();
		});
	}

	async patchPeopleListItem() {
		await waitForElement(peopleItemSelector);
		const element: HTMLElement = document.querySelector(peopleItemSelector);
		const targetInstance = Utils.findInTree(
			ReactUtils.getInternalInstance(element),
			(n) => n?.elementType?.prototype?.componentWillEnter,
			{ walkable: ["return"] }
		);
		const PeopleListItem = targetInstance?.elementType;
		if (!PeopleListItem) return Logger.error("PeopleListItem component not found");
		Patcher.after(PeopleListItem.prototype, "render", (that: any, _, ret) => {
			if (!that.props.user) return;
			const children = ret.props.children;
			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				Utils.findInTree(childrenRet, (i) => Array.isArray(i), { walkable: ["props", "children"] }).splice(
					1,
					0,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={that.props.user.id} context="peoplelist" />
					</div>
				);
				return childrenRet;
			};
		});
		forceUpdateAll(peopleItemSelector, (i) => i.user);
	}

	patchGuildIcon() {
		const element: HTMLElement = document.querySelector(guildIconSelector);
		if (!element) return Logger.error("Guild icon element not found");
		const targetInstance = Utils.findInTree(
			ReactUtils.getInternalInstance(element),
			(n) => n?.elementType?.type && n.pendingProps?.mediaState,
			{ walkable: ["return"] }
		);
		const GuildIconComponent = targetInstance?.elementType;
		if (!GuildIconComponent) return Logger.error("Guild icon component not found");
		Patcher.before(GuildIconComponent, "type", (_, [props]: [any]) => {
			const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState();
			const mediaState = useStateFromStores([Stores.VoiceStateStore], () =>
				getGuildMediaState(props.guild.id, ignoredChannels)
			);

			if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
				props.mediaState = { ...props.mediaState, ...mediaState };
			} else if (!props.mediaState.participating) {
				props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
			}
		});
		forceRerender(element);
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
		forceUpdateAll(peopleItemSelector, (i) => i.user);
		forceRerender(document.querySelector(guildIconSelector));
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
