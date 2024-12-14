import { ContextMenu, DOM, Patcher, Utils, Meta } from "betterdiscord";
import styles from "styles";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import {
	MemberListItem,
	Stores,
	children,
	iconWrapperSelector,
	useStateFromStores,
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
			const children = ret.props.children;

			ret.props.children = (childrenProps) => {
				const childrenRet = children(childrenProps);

				const icon = <VoiceIcon userId={props.user.id} context="memberlist" />;

				Array.isArray(childrenRet.props.children)
					? childrenRet.props.children.unshift(icon)
					: (childrenRet.props.children = [icon]);

				return childrenRet;
			};
		});
	}

	patchPrivateChannel() {
		const patchType = (props, ret) => {
			if (props.channel.type !== 1) return ret;

			const children = ret.props.children;
			ret.props.children = (childrenProps) => {
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

		let patchedType;

		Patcher.after(PrivateChannel, "ZP", (_, __, containerRet) => {
			if (patchedType) {
				containerRet.type = patchedType;
				return containerRet;
			}

			const original = containerRet.type;

			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};

			containerRet.type = patchedType;
		});
	}

	patchPeopleListItem() {
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
		Patcher.before(GuildIcon, "type", (_, [props]: [any]) => {
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
