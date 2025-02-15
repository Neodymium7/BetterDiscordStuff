import { Changes, DOM, Meta, Plugin } from "betterdiscord";
import { buildSettingsPanel, showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import { accountClasses } from "./modules/discordmodules";
import { Settings, Strings } from "./modules/utils";
import Tooltip from "./modules/tooltip";
import { UserSettingsWindow, SettingsSections } from "@discord/modules";

const settingsSelector = `.${accountClasses.container} > div > button:nth-last-child(1)`;

export default class AvatarSettingsButton implements Plugin {
	meta: Meta;
	target: HTMLElement | null = null;
	tooltip: Tooltip | null = null;
	clearListeners?: () => void;
	lastContextMenuTimestamp?: number;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
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

	observer({ addedNodes }: MutationRecord) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			if (!(node instanceof HTMLElement)) continue;

			const avatarWrapper = node.querySelector(`.${accountClasses.avatarWrapper}`);
			if (avatarWrapper instanceof HTMLElement) {
				this.target = avatarWrapper;
				this.addListeners();
				this.addTooltip();
			}
		}
	}

	openPopout() {
		this.target?.dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
			})
		);
	}

	openSettings() {
		UserSettingsWindow?.setSection(SettingsSections.ACCOUNT);
		if (document.querySelector(`.${accountClasses.accountProfilePopoutWrapper}`)) this.openPopout();
		UserSettingsWindow?.open();
	}

	openContextMenu(e: MouseEvent) {
		if (document.querySelector(`.${accountClasses.accountProfilePopoutWrapper}`)) this.openPopout();
		document.querySelector(settingsSelector)?.dispatchEvent(
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

		const clickAction = actions[Settings.get("click")];
		const click = (e: MouseEvent) => {
			if (e.isTrusted) {
				e.preventDefault();
				e.stopPropagation();
				clickAction?.(e);
				this.tooltip?.forceHide();
			}
		};

		const contextmenuAction = actions[Settings.get("contextmenu")];
		const contextmenu = (e: MouseEvent) => {
			// Prevent double contextmenu events (not sure why it's happening)
			if (e.timeStamp === this.lastContextMenuTimestamp) {
				return;
			}
			this.lastContextMenuTimestamp = e.timeStamp;

			contextmenuAction?.(e);
			this.tooltip?.forceHide();
		};

		const middleclickAction = actions[Settings.get("middleclick")];
		const middleclick = (e: MouseEvent) => {
			if (e.button === 1) {
				middleclickAction?.(e);
				this.tooltip?.forceHide();
			}
		};

		this.target.addEventListener("click", click);
		this.target.addEventListener("contextmenu", contextmenu);
		this.target.addEventListener("mousedown", middleclick);

		this.clearListeners = () => {
			this.target?.removeEventListener("click", click);
			this.target?.removeEventListener("contextmenu", contextmenu);
			this.target?.removeEventListener("mousedown", middleclick);
		};
	}

	addTooltip() {
		if (!this.target) return;
		this.tooltip?.remove();
		this.tooltip = null;
		if (!Settings.get("showTooltip")) return;

		const click = Settings.get("click");
		if (click === 0) return;
		const tooltips = [
			"",
			Strings.get("TOOLTIP_USER_SETTINGS"),
			Strings.get("TOOLTIP_SETTINGS_SHORTCUT"),
			Strings.get("TOOLTIP_SET_STATUS"),
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
		return buildSettingsPanel(Settings, [
			{
				id: "click",
				type: "radio",
				name: Strings.get("SETTINGS_CLICK"),
				note: Strings.get("SETTINGS_CLICK_NOTE"),
				options: [
					{
						name: `${Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS")} (${Strings.get("DEFAULT")})`,
						value: 1,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				],
			},
			{
				id: "contextmenu",
				type: "radio",
				name: Strings.get("SETTINGS_RIGHT_CLICK"),
				note: Strings.get("SETTINGS_RIGHT_CLICK_NOTE"),
				options: [
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_STATUS_PICKER")} (${Strings.get("DEFAULT")})`,
						value: 3,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				],
			},
			{
				id: "middleclick",
				type: "radio",
				name: Strings.get("SETTINGS_MIDDLE_CLICK"),
				note: Strings.get("SETTINGS_MIDDLE_CLICK_NOTE"),
				options: [
					{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
					{
						name: `${Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU")} (${Strings.get("DEFAULT")})`,
						value: 2,
					},
					{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
					{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
				],
			},
			{
				id: "showTooltip",
				type: "switch",
				name: Strings.get("SETTINGS_TOOLTIP"),
				note: Strings.get("SETTINGS_TOOLTIP_NOTE"),
			},
		]);
	}
}
