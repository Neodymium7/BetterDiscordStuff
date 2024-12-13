import { ContextMenu, DOM, Patcher, ReactUtils, Utils, Meta, Logger } from "betterdiscord";
import styles from "styles";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import {
	PrivateChannelContainer,
	MemberListItem,
	Stores,
	children,
	iconWrapperSelector,
	peopleItemSelector,
	useStateFromStores,
	UserPanelBody,
	UserPopoutBody,
} from "./modules/discordmodules";
import { Settings, Strings, forceRerender, forceUpdateAll, getGuildMediaState, waitForElement } from "./modules/utils";
import iconStyles from "./styles/voiceicon.module.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoiceProfileSection from "./components/VoiceProfileSection";
import SettingsPanel from "./components/SettingsPanel";

const guildIconSelector = `div:not([data-dnd-name]) + ${iconWrapperSelector}`;

export default class VoiceActivity {
	meta: Meta;
	contextMenuUnpatches = new Set<() => void>();

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog, this.meta);
		DOM.addStyle(styles() + `${children}:empty { margin-left: 0; } ${children} { display: flex; gap: 8px; }`);
		Strings.subscribe();
		this.patchPeopleListItem();
		this.patchMemberListItem();
		this.patchUserPanel();
		this.patchUserPopout();
		this.patchPrivateChannel();
		this.patchGuildIcon();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}

	patchUserPanel() {
		Patcher.after(UserPanelBody, "Z", (_, [props]: [any], ret) => {
			ret.props.children.splice(1, 0, <VoiceProfileSection userId={props.user.id} panel />);
		});
	}

	patchUserPopout() {
		Patcher.after(UserPopoutBody, "Z", (_, [props]: [any], ret) => {
			ret.props.children.splice(5, 0, <VoiceProfileSection userId={props.user.id} />);
		});
	}

	patchMemberListItem() {
		Patcher.after(MemberListItem, "Z", (_, [props]: [any], ret) => {
			if (!props.user) return ret;

			const patch = (element) => {
				const icon = <VoiceIcon userId={props.user.id} context="memberlist" />;

				Array.isArray(element.props.children)
					? element.props.children.unshift(icon)
					: (element.props.children = [icon]);
			};

			// Stable
			if (ret.props.avatar) {
				patch(ret);
			}

			// PTB/Canary
			else {
				const children = ret.props.children;
				ret.props.children = (childrenProps) => {
					const childrenRet = children(childrenProps);
					patch(childrenRet);
					return childrenRet;
				};
			}
		});
	}

	patchPrivateChannel() {
		Patcher.after(PrivateChannelContainer, "render", (_, [props]: [any], ret) => {
			if (!props.className) return ret;
			if (typeof props.to !== "string") return ret;

			const split = props.to.split("/");
			const channelId = split[split.length - 1];
			const channel = Stores.ChannelStore.getChannel(channelId);
			if (channel.type !== 1) return ret;

			const userId = channel.recipients[0];

			const children = ret.props.children;
			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);
				const privateChannel = Utils.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
					walkable: ["children", "props"],
				});
				privateChannel.children = [
					privateChannel.children,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={userId} context="dmlist" />
					</div>,
				];
				return childrenRet;
			};
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
			if (!props?.guild) return;

			const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState(
				"showGuildIcons",
				"ignoredGuilds",
				"ignoredChannels"
			);
			const mediaState = useStateFromStores([Stores.VoiceStateStore], () =>
				getGuildMediaState(props.guild.id, ignoredChannels)
			);

			if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
				props.mediaState = { ...props.mediaState, ...mediaState };
			} else if (!props.mediaState.isCurrentUserConnected) {
				props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
			}
		});
		forceRerender(element);
	}

	patchChannelContextMenu() {
		const unpatch = ContextMenu.patch("channel-context", (ret, props) => {
			if (!Settings.get("ignoreEnabled")) return ret;
			if (props.channel.type !== 2 && props.channel.type !== 13) return ret;

			const { ignoredChannels } = Settings.useSettingsState("ignoredChannels");
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
				},
			});

			ret.props.children[3].props.children.splice(2, 0, menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	patchGuildContextMenu() {
		const unpatch = ContextMenu.patch("guild-context", (ret, props) => {
			if (!Settings.get("ignoreEnabled")) return ret;

			const { ignoredGuilds } = Settings.useSettingsState("ignoredGuilds");
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
				},
			});

			ret.props.children[2].props.children.push(menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		forceUpdateAll(peopleItemSelector, (i) => i.user);
		forceRerender(document.querySelector(guildIconSelector));
		this.contextMenuUnpatches.forEach((unpatch) => unpatch());
		this.contextMenuUnpatches.clear();
		Strings.unsubscribe();
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
