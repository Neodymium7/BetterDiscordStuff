import BasePlugin from "@zlibrary/plugin";
import React from "react";
import Styles from "bundlebd/styles";
import { ContextMenu, DiscordModules, Patcher, ReactComponents, Utilities, WebpackModules } from "@zlibrary";
import Settings from "bundlebd/settings";
import Strings from "bundlebd/strings";
import locales from "./locales.json";
import { forceUpdateAll, getLazyModule } from "./utils";
import iconStyle from "./components/voiceicon.scss?module";
import VoiceIcon from "./components/VoiceIcon";
import VoicePopoutSection from "./components/VoicePopoutSection";
import SettingsPanel from "./components/SettingsPanel";
import ModalActivityItem from "./components/ModalActivityItem";

const { UserStore } = DiscordModules;
const { useStateFromStores } = WebpackModules.getByProps("useStateFromStores");

const memberItemSelector = `.${WebpackModules.getByProps("member", "activity").member}`;
const privateChannelSelector = `.${WebpackModules.getByProps("channel", "activity").channel}`;
const peopleItemSelector = `.${WebpackModules.getByProps("peopleListItem").peopleListItem}`;
const children = WebpackModules.getByProps("avatar", "children").children;

const VoiceStates = WebpackModules.getByProps("getVoiceStateForUser");

export default class VoiceActivity extends BasePlugin {
	onStart() {
		Styles.inject();
		Styles.add(`.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`);
		Strings.initialize(locales);
		Settings.setDefaults({
			showMemberListIcons: true,
			showDMListIcons: true,
			showPeopleListIcons: true,
			currentChannelColor: true,
			ignoreEnabled: false,
			ignoredChannels: [],
			ignoredGuilds: []
		});
		this.patchUserPopoutBody();
		this.patchUserProfileModal();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchContextMenu();
	}

	patchUserPopoutBody() {
		const UserPopoutBody = WebpackModules.getModule(m => m.default.displayName === "UserPopoutBody");
		Patcher.after(UserPopoutBody, "default", (_, [props], ret) => {
			ret?.props.children.splice(1, 0, <VoicePopoutSection userId={props.user.id} />);
		});
	}

	async patchUserProfileModal() {
		const UserProfileModal = await getLazyModule(m => m.default?.displayName === "UserProfileModal");
		const UserProfileBody = WebpackModules.getModule(m => m.default?.toString() && /case .\.UserProfileSections/.test(m.default.toString()));
		const UserProfileActivity = WebpackModules.getModule(m => m.default?.displayName === "UserProfileActivity");
		const tabBarItem = WebpackModules.getByProps("tabBarContainer").tabBarItem;

		Patcher.after(UserProfileModal, "default", (_, [modalProps], modalRet) => {
			if (modalProps.user.id !== UserStore.getCurrentUser().id) {
				const tabBar = Utilities.findInTree(modalRet, e => e.props?.section && e.props?.user, { walkable: ["props", "children"] });
				const type = tabBar.type;
				tabBar.type = props => {
					const voiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(props.user.id));
					const ret = type(props);
					if (!props.hasActivity && voiceState) {
						const items = Utilities.findInTree(ret, e => Array.isArray(e), { walkable: ["props", "children"] });
						const Item = items[0].type;
						items[1] = (
							<Item className={tabBarItem} id="VOICE_ACTIVITY">
								Activity
							</Item>
						);
					}
					if (props.hasActivity && props.section === "VOICE_ACTIVITY") {
						props.setSection("ACTIVITY");
					}
					return ret;
				};
			}
		});
		Patcher.instead(UserProfileBody, "default", (_, [props], original) => {
			if (props.selectedSection === "VOICE_ACTIVITY") {
				return <UserProfileActivity.default user={props.user} />;
			}
			return original(props);
		});
		Patcher.after(UserProfileActivity, "default", (_, [props], ret) => {
			ret.props.children[1].unshift(<ModalActivityItem userId={props.user.id} />);
		});
	}

	async patchMemberListItem() {
		const MemberListItem = await ReactComponents.getComponentByName("MemberListItem", memberItemSelector);
		Patcher.after(MemberListItem.component.prototype, "render", (thisObject, _, ret) => {
			if (thisObject.props.user) {
				Array.isArray(ret.props.children)
					? ret.props.children.unshift(<VoiceIcon userId={thisObject.props.user.id} context="memberlist" />)
					: (ret.props.children = [<VoiceIcon userId={thisObject.props.user.id} context="memberlist" />]);
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

	async patchContextMenu() {
		const HideNamesItem = await ContextMenu.getDiscordMenu("useChannelHideNamesItem");
		Patcher.after(HideNamesItem, "default", (_, [channel], ret) => {
			if (!Settings.get("ignoreEnabled")) return ret;
			const ignoredChannels = Settings.useSettingState("ignoredChannels");
			const ignored = ignoredChannels.includes(channel.id);
			const menuItem = ContextMenu.buildMenuItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredChannels = ignoredChannels.filter(id => id !== channel.id);
						Settings.set("ignoredChannels", newIgnoredChannels);
					} else {
						const newIgnoredChannels = [...ignoredChannels, channel.id];
						Settings.set("ignoredChannels", newIgnoredChannels);
					}
				}
			});
			return [ret, menuItem];
		});
		const GuildContextMenu = await ContextMenu.getDiscordMenu("GuildContextMenu");
		Patcher.after(GuildContextMenu, "default", (_, [props], ret) => {
			if (!Settings.get("ignoreEnabled")) return ret;
			const ignoredGuilds = Settings.useSettingState("ignoredGuilds");
			const ignored = ignoredGuilds.includes(props.guild.id);
			const menuItem = ContextMenu.buildMenuItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredGuilds = ignoredGuilds.filter(id => id !== props.guild.id);
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					} else {
						const newIgnoredGuilds = [...ignoredGuilds, props.guild.id];
						Settings.set("ignoredGuilds", newIgnoredGuilds);
					}
				}
			});
			ret.props.children[2].props.children.push(menuItem);
		});
	}

	onStop() {
		Patcher.unpatchAll();
		Styles.clear();
		Strings.unsubscribe();
		forceUpdateAll(memberItemSelector);
		forceUpdateAll(privateChannelSelector);
		forceUpdateAll(peopleItemSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
