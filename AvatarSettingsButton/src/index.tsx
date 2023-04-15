import { DOM, Webpack } from "betterdiscord";
import BasePlugin from "zlibrary/plugin";
import { Settings, Strings } from "./utils";
import SettingsPanel from "./components/SettingsPanel";

const {
	Filters: { byProps },
	getModule,
} = Webpack;

const UserSettingsWindow = getModule(byProps("saveAccountChanges"));
const Sections = getModule(byProps("ACCOUNT"), { searchExports: true });

const accountClasses = getModule(byProps("buildOverrideButton"));
const tooltipClasses = getModule(byProps("tooltipContent"));
const layerContainerClass = getModule(byProps("layerContainer")).layerContainer;
const appClass = getModule(byProps("appAsidePanelWrapper")).app;
const settingsSelector = `.${accountClasses.container} button:nth-last-child(1)`;

class Tooltip {
	private target: HTMLElement;
	private tooltip: HTMLElement;
	private layerContainer: HTMLElement;
	private ref: HTMLElement;
	private clearListeners: () => void;

	constructor(target: HTMLElement, text: string) {
		this.target = target;
		this.layerContainer = document.querySelector(`.${appClass} ~ .${layerContainerClass}`);

		const pointer = document.createElement("div");
		pointer.className = tooltipClasses.tooltipPointer;
		pointer.style.left = "calc(50% + 0px)";

		const content = document.createElement("div");
		content.className = tooltipClasses.tooltipContent;
		content.innerHTML = text;

		this.tooltip = document.createElement("div", {});
		this.tooltip.style.position = "fixed";
		this.tooltip.style.opacity = "0";
		this.tooltip.style.transform = "scale(0.95)";
		this.tooltip.style.transition = "opacity 0.1s, transform 0.1s";
		this.tooltip.className = `${tooltipClasses.tooltip} ${tooltipClasses.tooltipTop} ${tooltipClasses.tooltipPrimary}`;
		this.tooltip.appendChild(pointer);
		this.tooltip.appendChild(content);

		const show = () => this.show();
		const hide = () => this.hide();

		this.target.addEventListener("mouseenter", show);
		this.target.addEventListener("mouseleave", hide);

		this.clearListeners = () => {
			this.target.removeEventListener("mouseenter", show);
			this.target.removeEventListener("mouseleave", hide);
		};
	}

	show() {
		this.ref = this.tooltip.cloneNode(true) as HTMLElement;
		this.layerContainer.appendChild(this.ref);

		const targetRect = this.target.getBoundingClientRect();
		const tooltipRect = this.ref.getBoundingClientRect();

		this.ref.style.top = `${targetRect.top - tooltipRect.height - 8}px`;
		this.ref.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
		this.ref.style.opacity = "1";
		this.ref.style.transform = "none";
	}

	hide() {
		const ref = this.ref;
		ref.style.opacity = "0";
		ref.style.transform = "scale(0.95)";
		setTimeout(() => ref?.remove(), 100);
	}

	forceHide() {
		this.ref?.remove();
	}

	remove() {
		this.clearListeners();
		this.forceHide();
	}
}

export default class AvatarSettingsButton extends BasePlugin {
	target: Element = null;
	tooltip: Tooltip = null;
	clearListeners: () => void;

	onStart() {
		DOM.addStyle(`${settingsSelector} { display: none; } .${accountClasses.withTagAsButton} { width: 100%; }`);
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
		UserSettingsWindow.open();
		if (document.querySelector("#status-picker") || document.querySelector("#account")) this.openPopout();
	}

	openContextMenu(e: MouseEvent) {
		document.querySelector(settingsSelector).dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: e.clientX,
				clientY: screen.height - 12,
			})
		);
		if (document.querySelector("#status-picker") || document.querySelector("#account")) this.openPopout();
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

	onStop() {
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
