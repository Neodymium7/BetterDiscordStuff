import { ContextMenu, DOM, Patcher, Utils, Meta, Plugin, Changes } from "betterdiscord";
import styles from "styles";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import {
	MemberListItem,
	children,
	iconWrapperSelector,
	UserPanelBody,
	UserPopoutBody,
	PrivateChannel,
	GuildIcon,
	PeopleListItem,
} from "./modules/discordmodules";
import { Settings, Strings, forceRerender, getGuildMediaState } from "./modules/utils";
import iconStyles from "./styles/voiceicon.module.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoiceProfileSection from "./components/VoiceProfileSection";
import SettingsPanel from "./components/SettingsPanel";
import { useStateFromStores, VoiceStateStore } from "@discord/stores";

const guildIconSelector = `div:not([data-dnd-name]) + ${iconWrapperSelector}`;

export default class VoiceActivity implements Plugin {
	meta: Meta;
	contextMenuUnpatches = new Set<() => void>();

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
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
		if (!UserPanelBody) return;
		const [module, key] = UserPanelBody;
		Patcher.after(module, key, (_, [props], ret) => {
			ret.props.children.splice(1, 0, <VoiceProfileSection userId={props.user.id} panel />);
		});
	}

	patchUserPopout() {
		if (!UserPopoutBody) return;
		const [module, key] = UserPopoutBody;
		Patcher.after(module, key, (_, [props], ret) => {
			ret.props.children.splice(5, 0, <VoiceProfileSection userId={props.user.id} />);
		});
	}

	patchMemberListItem() {
		if (!MemberListItem) return;
		const [module, key] = MemberListItem;
		Patcher.after(module, key, (_, [props], ret) => {
			if (!props.user) return ret;
			const children = ret.props.children;

			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);

				const target = childrenRet.props.children;

				const icon = <VoiceIcon userId={props.user.id} context="memberlist" />;

				Array.isArray(target.props.children)
					? target.props.children.unshift(icon)
					: (target.props.children = [icon]);

				return childrenRet;
			};
		});
	}

	patchPrivateChannel() {
		if (!PrivateChannel) return;
		const patchType = (props: any, ret: any) => {
			if (props.channel.type !== 1) return;

			// Plugin compatibility fix (PlatformIndicators)
			let target = ret;
			if (typeof target.props.children != "function") target = ret.props.children;

			const children = target.props.children;
			target.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);

				const privateChannel = Utils.findInTree(childrenRet, (e) => e?.children?.props?.avatar, {
					walkable: ["children", "props"],
				});
				privateChannel.children = [
					privateChannel.children,
					<div className={iconStyles.iconContainer}>
						<VoiceIcon userId={props.user.id} context="dmlist" />
					</div>,
				];

				return childrenRet;
			};
		};

		let patchedType: ((props: any) => React.ReactNode) | undefined;

		const [module, key] = PrivateChannel;
		Patcher.after(module, key, (_, __, containerRet) => {
			// Compatibility fix (ChannelsPreview)
			let target: React.ReactElement = (containerRet as any).children || containerRet;

			if (patchedType) {
				target.type = patchedType;
				return containerRet;
			}

			const original = target.type as React.FunctionComponent<any>;

			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};

			target.type = patchedType;
		});
	}

	patchPeopleListItem() {
		if (!PeopleListItem) return;
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
	}

	patchGuildIcon() {
		if (!GuildIcon) return;

		Patcher.before(GuildIcon, "type", (_, [props]) => {
			if (!props?.guild) return;

			const { showGuildIcons, ignoredGuilds, ignoredChannels } = Settings.useSettingsState(
				"showGuildIcons",
				"ignoredGuilds",
				"ignoredChannels"
			);
			const mediaState = useStateFromStores([VoiceStateStore], () =>
				getGuildMediaState(props.guild.id, ignoredChannels)
			);

			if (showGuildIcons && !ignoredGuilds.includes(props.guild.id)) {
				props.mediaState = { ...props.mediaState, ...mediaState };
			} else if (!props.mediaState.isCurrentUserConnected) {
				props.mediaState = { ...props.mediaState, ...{ audio: false, video: false, screenshare: false } };
			}
		});
		forceRerender(document.querySelector(guildIconSelector));
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
		forceRerender(document.querySelector(guildIconSelector));
		this.contextMenuUnpatches.forEach((unpatch) => unpatch());
		this.contextMenuUnpatches.clear();
		Strings.unsubscribe();
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
