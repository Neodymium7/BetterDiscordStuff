import { DOM } from "betterdiscord";
import BasePlugin from "zlibrary/plugin";
import SettingsPanel from "./components/SettingsPanel";
import { GuildStore, roleMention } from "./modules/discordmodules";
import { Settings, Strings, filter, getIconElement, getProps, peopleSVG } from "./modules/utils";

export default class RoleMentionIcons extends BasePlugin {
	clearCallbacks: Set<() => void>;

	constructor() {
		super();
		this.clearCallbacks = new Set();
	}

	onStart() {
		DOM.addStyle(
			`.role-mention-icon { position: relative; height: 1em; width: 1em; margin-left: 4px; } .${roleMention} { display: inline-flex; align-items: center; }`
		);
		Strings.subscribe();

		const elements = Array.from(document.getElementsByClassName(roleMention));
		this.processElements(elements);
	}

	observer({ addedNodes }) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			const elements = Array.from(node.getElementsByClassName(roleMention));
			this.processElements(elements);
		}
	}

	processElements(elements) {
		if (!elements.length) return;

		for (const element of elements) {
			const props = getProps(element, (e) => e.roleName || e.roleId);
			if (!props) return;

			const isEveryone = props.roleName === "@everyone";
			const isHere = props.roleName === "@here";
			let role;
			if (props.guildId) {
				role = filter(GuildStore.getRoles(props.guildId), (r) => r.id === props.roleId);
				role = role[Object.keys(role)[0]];
			}
			if ((Settings.everyone || !isEveryone) && (Settings.here || !isHere)) {
				if (role?.icon && Settings.showRoleIcons) {
					const icon = getIconElement(role.id, role.icon);
					element.appendChild(icon);
					this.clearCallbacks.add(() => icon.remove());
				} else {
					const icon = peopleSVG.cloneNode(true) as HTMLElement;
					element.appendChild(icon);
					this.clearCallbacks.add(() => icon.remove());
				}
			}
		}
	}

	clearIcons() {
		this.clearCallbacks.forEach((callback) => callback());
		this.clearCallbacks.clear();
	}

	onStop() {
		DOM.removeStyle();
		Strings.unsubscribe();
		this.clearIcons();
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
