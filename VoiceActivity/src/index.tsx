import { clearCSS, injectCSS, Webpack } from "betterdiscord";
import { ContextMenu, DiscordModules, Patcher, ReactComponents, Utilities } from "zlibrary";
import BasePlugin from "zlibrary/plugin";
import styles from "styles";
import { Settings, Strings, VoiceStateStore, useStateFromStores, forceUpdateAll } from "./utils";
import iconStyles from "./styles/voiceicon.scss?module";
import VoiceIcon from "./components/VoiceIcon";
import VoicePopoutSection from "./components/VoicePopoutSection";
import ModalActivityItem from "./components/ModalActivityItem";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byProps, byDisplayName },
	getModule,
	waitForModule
} = Webpack;

const { UserStore } = DiscordModules;

const memberItemSelector = `.${getModule(byProps("member", "activity")).member}`;
const privateChannelSelector = `.${getModule(byProps("channel", "activity")).channel}`;
const peopleItemSelector = `.${getModule(byProps("peopleListItem")).peopleListItem}`;
const children = getModule(byProps("avatar", "children")).children;

export default class VoiceActivity extends BasePlugin {
	onStart() {
		injectCSS(
			"VoiceActivity",
			styles() + `.${children}:empty { margin-left: 0; } .${children} { display: flex; gap: 8px; }`
		);
		Strings.subscribe();
		this.patchUserPopout();
		this.patchUserProfileModal();
		this.patchMemberListItem();
		this.patchPrivateChannel();
		this.patchPeopleListItem();
		this.patchChannelContextMenu();
		this.patchGuildContextMenu();
	}

	patchUserPopout() {
		const UserPopoutBody = getModule((m) => m.default?.displayName === "UserPopoutBody");
		Patcher.after(UserPopoutBody, "default", (_, [props], ret) => {
			ret?.props.children.splice(1, 0, <VoicePopoutSection userId={props.user.id} />);
		});

		const UserPopoutBodyV2 = getModule((m) => m.default?.toString().includes("hidePersonalInformation:"));
		const UserPopoutSection = getModule(byDisplayName("UserPopoutSection"));
		Patcher.after(UserPopoutBodyV2, "default", (_, [props], ret) => {
			const popoutSections = ret.props.children[3].props.children;
			const activitySectionIndex = popoutSections.findIndex((section: any) =>
				section.props.hasOwnProperty("activity")
			);
			popoutSections.splice(
				activitySectionIndex,
				0,
				<UserPopoutSection>
					<VoicePopoutSection userId={props.user.id} v2 />
				</UserPopoutSection>
			);
		});
	}

	async patchUserProfileModal() {
		const UserProfileModal = await waitForModule((m) => m.default?.displayName === "UserProfileModal");
		const UserProfileBody = getModule(
			(m) => m.default?.toString() && /case .\.UserProfileSections/.test(m.default.toString())
		);
		const UserProfileActivity = getModule((m) => m.default?.displayName === "UserProfileActivity");
		const tabBarItem = getModule(byProps("tabBarContainer")).tabBarItem;

		Patcher.after(UserProfileModal, "default", (_, [modalProps], modalRet) => {
			if (modalProps.user.id !== UserStore.getCurrentUser().id) {
				const tabBar = Utilities.findInTree(modalRet, (e) => e.props?.section && e.props?.user, {
					walkable: ["props", "children"]
				});
				const type = tabBar.type;
				tabBar.type = (props: any) => {
					const voiceState = useStateFromStores([VoiceStateStore], () =>
						VoiceStateStore.getVoiceStateForUser(props.user.id)
					);
					const ret = type(props);
					if (!props.hasActivity && voiceState) {
						const items = Utilities.findInTree(ret, (e) => Array.isArray(e), {
							walkable: ["props", "children"]
						});
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
		const PeopleListItem = await ReactComponents.getComponentByName("PeopleListItem", peopleItemSelector);
		Patcher.after(PeopleListItem.component.prototype, "render", (thisObject, _, ret) => {
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
		const HideNamesItem = await ContextMenu.getDiscordMenu("useChannelHideNamesItem");
		Patcher.after(HideNamesItem, "default", (_, [channel], ret) => {
			if (!Settings.get("ignoreEnabled")) return ret;
			const { ignoredChannels } = Settings.useSettingsState();
			const ignored = ignoredChannels.includes(channel.id);
			const menuItem = ContextMenu.buildMenuItem({
				type: "toggle",
				label: Strings.get("CONTEXT_IGNORE"),
				id: "voiceactivity-ignore",
				checked: ignored,
				action: () => {
					if (ignored) {
						const newIgnoredChannels = ignoredChannels.filter((id) => id !== channel.id);
						Settings.set("ignoredChannels", newIgnoredChannels);
					} else {
						const newIgnoredChannels = [...ignoredChannels, channel.id];
						Settings.set("ignoredChannels", newIgnoredChannels);
					}
				}
			});
			return [ret, menuItem];
		});
	}

	async patchGuildContextMenu() {
		const GuildContextMenu = await ContextMenu.getDiscordMenu("GuildContextMenuWrapper");
		Patcher.after(GuildContextMenu, "default", (_, [props], ret) => {
			if (!Settings.get("ignoreEnabled")) return ret;

			const renderContextMenu = ret.props.children.type;
			ret.props.children.type = (menuProps: any) => {
				const menuRet = renderContextMenu(menuProps);

				const { ignoredGuilds } = Settings.useSettingsState();
				const ignored = ignoredGuilds.includes(menuProps.guild.id);
				const menuItem = ContextMenu.buildMenuItem({
					type: "toggle",
					label: Strings.get("CONTEXT_IGNORE"),
					id: "voiceactivity-ignore",
					checked: ignored,
					action: () => {
						if (ignored) {
							const newIgnoredGuilds = ignoredGuilds.filter((id) => id !== menuProps.guild.id);
							Settings.set("ignoredGuilds", newIgnoredGuilds);
						} else {
							const newIgnoredGuilds = [...ignoredGuilds, menuProps.guild.id];
							Settings.set("ignoredGuilds", newIgnoredGuilds);
						}
					}
				});
				menuRet.props.children[2].props.children.push(menuItem);

				return menuRet;
			};
		});
	}

	onStop() {
		clearCSS("VoiceActivity");
		Patcher.unpatchAll();
		Strings.unsubscribe();
		forceUpdateAll(memberItemSelector);
		forceUpdateAll(privateChannelSelector);
		forceUpdateAll(peopleItemSelector);
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
