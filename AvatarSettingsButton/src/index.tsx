import { DOM, Meta } from "betterdiscord";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import { Sections, UserSettingsWindow, accountClasses } from "./modules/discordmodules";
import { Settings, Strings } from "./modules/utils";
import Tooltip from "./modules/tooltip";
import SettingsPanel from "./components/SettingsPanel";

const settingsSelector = `.${accountClasses.container} button:nth-last-child(1)`;

export default class AvatarSettingsButton {
	meta: Meta;
	target: Element = null;
	tooltip: Tooltip = null;
	clearListeners: () => void;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog, this.meta);
		DOM.addStyle(`${settingsSelector} { display: none; } .${accountClasses.avatarWrapper} { width: 100%; }`);
		Strings.subscribe();
		Settings.addListener(() => {
			this.addListeners();
			this.addTooltip();
		});

		this.target = document.querySelector("." + accountClasses.avatarWrapper);
		this.addListeners();
		this.addTooltip();
	}

	observer({ addedNodes }) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;

			const avatarWrapper = node.querySelector(`.${accountClasses.avatarWrapper}`);
			if (avatarWrapper) {
				this.target = avatarWrapper;
				this.addListeners();
				this.addTooltip();
			}
		}
	}

	openPopout() {
		this.target.dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
			})
		);
	}

	openSettings() {
		UserSettingsWindow.setSection(Sections.ACCOUNT);
		if (document.querySelector(`.${accountClasses.accountProfilePopoutWrapper}`)) this.openPopout();
		UserSettingsWindow.open();
	}

	openContextMenu(e: MouseEvent) {
		if (document.querySelector(`.${accountClasses.accountProfilePopoutWrapper}`)) this.openPopout();
		document.querySelector(settingsSelector).dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: e.clientX,
				clientY: screen.height - 12,
			})
		);
	}

	addListeners() {
		if (!this.target) return;
		this.clearListeners?.();

		const actions = [
			null,
			this.openSettings.bind(this),
			this.openContextMenu.bind(this),
			this.openPopout.bind(this),
		];

		const clickAction = actions[Settings.click];
		const click = (e: MouseEvent) => {
			if (e.isTrusted) {
				e.preventDefault();
				e.stopPropagation();
				clickAction(e);
				this.tooltip?.forceHide();
			}
		};

		const contextmenuAction = actions[Settings.contextmenu];
		const contextmenu = (e: MouseEvent) => {
			contextmenuAction(e);
			this.tooltip?.forceHide();
		};

		const middleclickAction = actions[Settings.middleclick];
		const middleclick = (e: MouseEvent) => {
			if (e.button === 1) {
				middleclickAction(e);
				this.tooltip?.forceHide();
			}
		};

		this.target.addEventListener("click", click);
		this.target.addEventListener("contextmenu", contextmenu);
		this.target.addEventListener("mousedown", middleclick);

		this.clearListeners = () => {
			this.target.removeEventListener("click", click);
			this.target.removeEventListener("contextmenu", contextmenu);
			this.target.removeEventListener("mousedown", middleclick);
		};
	}

	addTooltip() {
		if (!this.target) return;
		this.tooltip?.remove();
		this.tooltip = null;
		if (!Settings.showTooltip) return;

		const click = Settings.click;
		if (click === 0) return;
		const tooltips = [
			"",
			Strings.TOOLTIP_USER_SETTINGS,
			Strings.TOOLTIP_SETTINGS_SHORTCUT,
			Strings.TOOLTIP_SET_STATUS,
		];
		this.tooltip = new Tooltip(this.target as HTMLElement, tooltips[click]);
	}

	stop() {
		DOM.removeStyle();
		Strings.unsubscribe();
		Settings.clearListeners();
		this.clearListeners?.();
		this.tooltip?.remove();
		this.target = null;
		this.tooltip = null;
	}

	getSettingsPanel() {
		return <SettingsPanel />;
	}
}
