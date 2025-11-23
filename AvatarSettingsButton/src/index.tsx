import { Changes, DOM, Meta, Plugin } from "betterdiscord";
import { buildSettingsPanel, showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import { accountClasses } from "./modules/discordmodules";
import { Settings, Strings } from "./modules/utils";
import Tooltip from "./modules/tooltip";

const settingsSelector = `.${accountClasses.container} > div > button:last-of-type`;
const baseStyle = `.${accountClasses.avatarWrapper} { min-width: 0; }`;
const hideStyle = `${settingsSelector} { display: none; }`;

export default class AvatarSettingsButton implements Plugin {
	meta: Meta;
	target: HTMLElement | null = null;
	tooltip: Tooltip | null = null;
	clearListener?: () => void;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
		DOM.addStyle(Settings.get("hideSettingsButton") ? baseStyle + hideStyle : baseStyle);
		Strings.subscribe();
		Settings.addListener((key, value) => {
			if (key === "hideSettingsButton") {
				DOM.removeStyle();
				DOM.addStyle(value ? baseStyle + hideStyle : baseStyle);
			}
			this.addListener();
			this.addTooltip();
		});

		this.target = document.querySelector("." + accountClasses.avatarWrapper);
		this.addListener();
		this.addTooltip();
	}

	observer({ addedNodes }: MutationRecord) {
		for (const node of addedNodes) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			if (!(node instanceof HTMLElement)) continue;

			const avatarWrapper = node.className.includes(accountClasses.avatarWrapper)
				? node
				: node.querySelector(`.${accountClasses.avatarWrapper}`);
			if (avatarWrapper instanceof HTMLElement) {
				this.target = avatarWrapper;
				this.addListener();
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
		document.querySelector(settingsSelector)?.dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
			})
		);
	}

	openContextMenu(e: MouseEvent) {
		document.querySelector(settingsSelector)?.dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: e.clientX,
				clientY: screen.height - 12,
			})
		);
	}

	addListener() {
		if (!this.target) return;
		this.clearListener?.();

		const actions = [
			null,
			this.openSettings.bind(this),
			this.openContextMenu.bind(this),
			this.openPopout.bind(this),
		];

		const clickAction = actions[Settings.get("click")];
		const contextmenuAction = actions[Settings.get("contextmenu")];
		const middleclickAction = actions[Settings.get("middleclick")];

		const clickHandler = (e: MouseEvent) => {
			if (e.button == 0 && e.isTrusted) {
				e.preventDefault();
				e.stopPropagation();
				clickAction?.(e);
			} else if (e.button == 2) contextmenuAction?.(e);
			else if (e.button == 1) middleclickAction?.(e);
			this.tooltip?.forceHide();
		};

		this.target.addEventListener("mousedown", clickHandler);

		this.clearListener = () => {
			this.target?.removeEventListener("mousedown", clickHandler);
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
		this.clearListener?.();
		this.tooltip?.remove();
		this.target = null;
		this.tooltip = null;
	}

	getSettingsPanel() {
		return buildSettingsPanel(Settings, [
			{
				id: "hideSettingsButton",
				type: "switch",
				name: Strings.get("SETTINGS_HIDE"),
				note: Strings.get("SETTINGS_HIDE_NOTE"),
			},
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
