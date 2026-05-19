import { DOM, Patcher, Webpack, Logger, UI, Data, Meta, Plugin, Utils, WithKeyResult } from "betterdiscord";
import { getSelectors, getIcon, waitForModuleWithKey } from "@lib/utils/webpack";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";

const Pin = getIcon("M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5");

if (!Pin) Logger.error("Pin icon not found.");

export default class PinnedMessageIcons implements Plugin {
	settings!: { backgroundEnabled: boolean };
	meta: Meta;
	modules: {
		Message: WithKeyResult<AnyComponent>;
		messageSelectors: any;
	} = {} as any;
	modulesLoaded = false;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	async getModules() {
		if (this.modulesLoaded) return;

		this.modules.Message = [
			...(await waitForModuleWithKey<AnyComponent>(
				Webpack.Filters.byStrings("childrenRepliedMessage", "focusProps")
			)),
		];

		const [module] = this.modules.Message;
		if (!module) return Logger.error("Message module not found");

		this.modules.messageSelectors = getSelectors("message", "mentioned", "replying");

		if (!this.modules.messageSelectors) Logger.error("Message selectors module not found.");

		this.modulesLoaded = true;
	}

	async start() {
		Updater.checkForUpdates(this.meta);

		this.settings = Data.load("settings");
		if (!this.settings) {
			this.settings = { backgroundEnabled: true };
			Data.save("settings", this.settings);
		}

		await this.getModules();
		this.addStyle();
		this.patch();
	}

	patch() {
		Patcher.after(...this.modules.Message, (_, [props], ret) => {
			const message = Utils.findInTree(props.childrenMessageContent, (x) => x.author && x.content, {
				walkable: ["props", "children", "message"],
			});

			if (!message) return ret;
			if (!props["data-list-item-id"]) return ret;
			if (props["data-list-item-id"].includes("pin")) return ret;

			if (!message.pinned) return ret;

			const messageNode = Utils.findInTree(ret, (e) => Array.isArray(e?.props?.children) && e?.props?.className, {
				walkable: ["props", "children"],
			});
			if (!messageNode) return ret;

			messageNode.props.className += " pinned-message";

			if (!Pin) return ret;

			messageNode.props.children.push(
				<Pin
					className="pinned-message-icon"
					color="var(--interactive-text-default)"
					size="20px"
					width="20px"
					height="20px"
				/>
			);
		});
	}

	addStyle() {
		let style =
			":root .pinned-message { padding-right: calc(var(--space-xl) + 36px) !important } .pinned-message-icon { position: absolute; bottom: calc(50% - 10px); right: 24px; }";

		if (this.modules.messageSelectors && this.settings.backgroundEnabled) {
			const selector = `${this.modules.messageSelectors.message}.pinned-message:not(${this.modules.messageSelectors.mentioned}):not(${this.modules.messageSelectors.replying})`;
			style += `${selector}::after { content: ""; position: absolute; display: block; width: inherit; height: inherit; left: 0px; bottom: 0px; right: 0px; top: 0px; background: var(--channels-default); opacity: 0.08; z-index: -1; border-radius: 4px; } ${selector}::before { content: ""; position: absolute; display: block; width: 2px; height: inherit; left: 0px; bottom: 0px; top: 0px; background: var(--channels-default); }`;
		}

		DOM.addStyle(style);
	}

	stop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
		Updater.closeNotice();
	}

	getSettingsPanel() {
		return UI.buildSettingsPanel({
			settings: [
				{
					type: "switch",
					id: "backgroundEnabled",
					name: "Pinned Message Background",
					note: "Adds a white background to pinned messages",
					value: this.settings.backgroundEnabled,
				},
			],
			onChange: (_, _id, value) => {
				this.settings.backgroundEnabled = value;
				DOM.removeStyle();
				this.addStyle();
				Data.save("settings", this.settings);
			},
		});
	}
}
