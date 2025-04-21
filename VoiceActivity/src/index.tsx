import { ContextMenu, DOM, Patcher, Utils, Meta, Plugin, Changes } from "betterdiscord";
import styles from "styles";
import { buildSettingsPanel, showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import {
	MemberListItem,
	memberSelectors,
	UserPanelBody,
	UserPopoutBody,
	PrivateChannel,
	PeopleListItem,
	VoiceActivityCard,
	UserPopoutActivity,
} from "./modules/discordmodules";
import { Settings, Strings } from "./modules/utils";
import iconStyles from "./styles/voiceicon.module.css";
import VoiceIcon from "./components/VoiceIcon";
import VoiceProfileSection from "./components/VoiceProfileSection";
import { transitionTo } from "@discord/modules";
import { VoiceStateStore } from "@discord/stores";

export default class VoiceActivity implements Plugin {
	meta: Meta;
	contextMenuUnpatches = new Set<() => void>();

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
		DOM.addStyle(
			styles() +
				`${memberSelectors?.children}:empty { margin-left: 0; } ${memberSelectors?.children} { display: flex; gap: 8px; } ${memberSelectors?.layout} { width: 100%; }`
		);
		Strings.subscribe();
		this.patchPeopleListItem();
		this.patchMemberListItem();
		this.patchUserPanel();
		this.patchUserPopout();
		this.patchVoiceActivityCard();
		this.patchUserPopoutActivity();
		this.patchPrivateChannel();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();

		// Fix voice state not being discoverable when not navigated to specific guild
		Patcher.instead(VoiceStateStore, "getDiscoverableVoiceState", (_, [guildId, userId]) => {
			return VoiceStateStore.getDiscoverableVoiceStateForUser(userId);
		});
	}

	patchUserPanel() {
		if (!UserPanelBody) return;
		const [module, key] = UserPanelBody;
		Patcher.after(module, key, (_, [props], ret) => {
			ret.props.children.splice(1, 0, <VoiceProfileSection user={props.user} />);
		});
	}

	patchUserPopout() {
		if (!UserPopoutBody) return;
		Patcher.after(...UserPopoutBody, (_, [props], ret) => {
			ret.props.children.splice(7, 0, <VoiceProfileSection user={props.user} onClose={props.onClose} />);
		});
	}

	// Override channel name click action to navigate to channel instead of join
	patchVoiceActivityCard() {
		const filter = (e: any) => Array.isArray(e) && e[0].props.size && e[1].props.onClick;

		if (!VoiceActivityCard) return;
		Patcher.after(...VoiceActivityCard, (_, [props], ret) => {
			const channelPath = props.voiceChannel.guild_id
				? `/channels/${props.voiceChannel.guild_id}/${props.voiceChannel.id}`
				: `/channels/@me/${props.voiceChannel.id}`;

			const channelText = Utils.findInTree(ret, filter, {
				walkable: ["props", "children"],
			})[1];

			channelText.props.onClick = (e: React.MouseEvent) => {
				e.stopPropagation();
				props.onClose?.();
				if (channelPath) transitionTo?.(channelPath);
			};
		});
	}

	// Remove default voice channel activity card to prevent duplicates
	patchUserPopoutActivity() {
		if (!UserPopoutActivity) return;
		Patcher.after(...UserPopoutActivity, (_, [props], ret) => {
			const { showProfileSection } = Settings.useSettingsState("showProfileSection");
			if (showProfileSection && ret?.props?.voiceChannel) return null;
		});
	}

	patchMemberListItem() {
		if (!MemberListItem) return;
		Patcher.after(...MemberListItem, (_, [props], ret) => {
			if (!props.user) return ret;
			const children = ret.props.children;

			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);

				const target = Utils.findInTree(childrenRet, (x) => x.props?.avatar && x.props?.decorators, {
					walkable: ["props", "children"],
				});

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

			// Plugin compatibility fix
			const target =
				Utils.findInTree(ret, (e) => typeof e?.props?.children !== "function", {
					walkable: ["children", "props"],
				})?.props?.children ?? ret;

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

		Patcher.after(...PrivateChannel, (_, __, containerRet) => {
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

			ret.props.children[3].props.children.splice(4, 0, menuItem);
		});

		this.contextMenuUnpatches.add(unpatch);
	}

	patchGuildContextMenu() {
		const unpatch = ContextMenu.patch("guild-context", (ret, props) => {
			if (!props.guild) return ret;
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
		this.contextMenuUnpatches.forEach((unpatch) => unpatch());
		this.contextMenuUnpatches.clear();
		Strings.unsubscribe();
	}

	getSettingsPanel() {
		return buildSettingsPanel(Settings, [
			{
				id: "showProfileSection",
				type: "switch",
				name: Strings.get("SETTINGS_PROFILE"),
				note: Strings.get("SETTINGS_PROFILE_NOTE"),
			},
			{
				id: "showMemberListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_ICONS"),
				note: Strings.get("SETTINGS_ICONS_NOTE"),
			},
			{
				id: "showDMListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_DM_ICONS"),
				note: Strings.get("SETTINGS_DM_ICONS_NOTE"),
			},
			{
				id: "showPeopleListIcons",
				type: "switch",
				name: Strings.get("SETTINGS_PEOPLE_ICONS"),
				note: Strings.get("SETTINGS_PEOPLE_ICONS_NOTE"),
			},
			{
				id: "currentChannelColor",
				type: "switch",
				name: Strings.get("SETTINGS_COLOR"),
				note: Strings.get("SETTINGS_COLOR_NOTE"),
			},
			{
				id: "showStatusIcons",
				type: "switch",
				name: Strings.get("SETTINGS_STATUS"),
				note: Strings.get("SETTINGS_STATUS_NOTE"),
			},
			{
				id: "ignoreEnabled",
				type: "switch",
				name: Strings.get("SETTINGS_IGNORE"),
				note: Strings.get("SETTINGS_IGNORE_NOTE"),
			},
		]);
	}
}
