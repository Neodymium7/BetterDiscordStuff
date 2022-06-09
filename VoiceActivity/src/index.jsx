import BasePlugin from "@zlibrary/plugin";
import React from "react";
import styles from "styles";
import { useStateFromStores } from "@discord/flux";
import { ContextMenu, Patcher, ReactComponents, Utilities, WebpackModules } from "@zlibrary";
import Settings from "./modules/settings";
import Strings from "./modules/strings";
import { forceUpdateAll } from "./modules/utils";
import iconStyle from "./components/voiceicon.scss";
import VoiceIcon from "./components/VoiceIcon";
import VoicePopoutSection from "./components/VoicePopoutSection";
import SettingsPanel from "./components/SettingsPanel";

const memberItemSelector = `.${WebpackModules.getByProps("member", "activity").member}`;
const privateChannelSelector = `.${WebpackModules.getByProps("channel", "activity").channel}`;
const peopleItemSelector = `.${WebpackModules.getByProps("peopleListItem").peopleListItem}`;

export default class VoiceActivity extends BasePlugin {
	onStart() {
		styles.inject();
		Strings.subscribe();
		this.patchUserPopoutBody();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchContextMenu();
	}

	async patchMemberListItem() {
		const MemberListItem = await ReactComponents.getComponentByName("MemberListItem", memberItemSelector);
		Patcher.after(MemberListItem.component.prototype, "render", (thisObject, _, ret) => {
			if (thisObject.props.user) {
				ret.props.children
					? (ret.props.children = (
							<div style={{ display: "flex", gap: "8px" }}>
								{ret.props.children}
								<VoiceIcon userId={thisObject.props.user.id} context="memberlist" />
							</div>
					  ))
					: (ret.props.children = <VoiceIcon userId={thisObject.props.user.id} context="memberlist" />);
			}
		});
		forceUpdateAll(memberItemSelector);
	}

	async patchPrivateChannel() {
		const PrivateChannel = await ReactComponents.getComponentByName("PrivateChannel", privateChannelSelector);
		Patcher.after(PrivateChannel.component.prototype, "render", (thisObject, _, ret) => {
			if (!thisObject.props.user) return;
			const props = Utilities.findInTree(ret, e => e?.children && e?.id, { walkable: ["children", "props"] });
			const children = props.children;
			props.children = childrenProps => {
				const childrenRet = children(childrenProps);
				const privateChannel = Utilities.findInTree(childrenRet, e => e?.children?.props?.avatar, {
					walkable: ["children", "props"]
				});
				privateChannel.children = [
					privateChannel.children,
					<div className={iconStyle.iconContainer}>
						<VoiceIcon userId={thisObject.props.user.id} context="dmlist" />
					</div>
				];
				return childrenRet;
			};
		});
		forceUpdateAll(privateChannelSelector);
	}

	async patchPeopleListItem() {
		const PeopleListItem = await ReactComponents.getComponentByName("PeopleListItem", peopleItemSelector);
		Patcher.after(PeopleListItem.component.prototype, "render", (thisObject, _, ret) => {
			if (!thisObject.props.user) return;
			const children = ret.props.children;
			ret.props.children = childrenProps => {
				const childrenRet = children(childrenProps);
				childrenRet.props.children.props.children.props.children.splice(
					1,
					0,
					<div className={iconStyle.iconContainer}>
						<VoiceIcon userId={thisObject.props.user.id} context="peoplelist" />
					</div>
				);
				return childrenRet;
			};
		});
		forceUpdateAll(peopleItemSelector);
	}

	patchUserPopoutBody() {
		const UserPopoutBody = WebpackModules.getModule(m => m.default.displayName === "UserPopoutBody");
		Patcher.after(UserPopoutBody, "default", (_, [props], ret) => {
			ret?.props.children.unshift(<VoicePopoutSection userId={props.user.id} />);
		});
	}

	async patchContextMenu() {
		const HideNamesItem = await ContextMenu.getDiscordMenu("useChannelHideNamesItem");
		Patcher.after(HideNamesItem, "default", (_, [channel], ret) => {
			if (!Settings.get("ignoreEnabled", false)) return ret;
			const ignoredChannels = useStateFromStores([Settings], () => Settings.get("ignoredChannels", []));
			const ignored = ignoredChannels.includes(channel.id);
			const menuItem = ContextMenu.buildMenuItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						Settings.set(
							"ignoredChannels",
							ignoredChannels.filter(id => id !== channel.id)
						);
					} else Settings.set("ignoredChannels", [...ignoredChannels, channel.id]);
				}
			});
			return [ret, menuItem];
		});
		const GuildContextMenu = await ContextMenu.getDiscordMenu("GuildContextMenu");
		Patcher.after(GuildContextMenu, "default", (_, [props], ret) => {
			if (!Settings.get("ignoreEnabled", false)) return ret;
			const ignoredGuilds = useStateFromStores([Settings], () => Settings.get("ignoredGuilds", []));
			const ignored = ignoredGuilds.includes(props.guild.id);
			const menuItem = ContextMenu.buildMenuItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						Settings.set(
							"ignoredGuilds",
							ignoredGuilds.filter(id => id !== props.guild.id)
						);
					} else Settings.set("ignoredGuilds", [...ignoredGuilds, props.guild.id]);
				}
			});
			ret.props.children[2].props.children.push(menuItem);
		});
	}

	onStop() {
		Patcher.unpatchAll();
		styles.remove();
		Strings.unsubscribe();
		forceUpdateAll(memberItemSelector);
		forceUpdateAll(privateChannelSelector);
		forceUpdateAll(peopleItemSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
