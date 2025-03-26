import { DOM, Patcher, Webpack, Logger, UI, Data, Meta, Plugin } from "betterdiscord";
import { getSelectors, getIcon } from "@lib/utils/webpack";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";

const Pin = getIcon("M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5");
const Message = Webpack.getWithKey<AnyComponent>(Webpack.Filters.byStrings("childrenRepliedMessage", "focusProps"));
const messageSelectors = getSelectors("message", "mentioned", "replying");

if (!Pin) Logger.error("Pin icon not found.");
if (!messageSelectors) Logger.error("Message selectors icon not found.");

export default class PinnedMessageIcons implements Plugin {
	settings!: { backgroundEnabled: boolean };
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);

		this.settings = Data.load("settings");
		if (!this.settings) {
			this.settings = { backgroundEnabled: true };
			Data.save("settings", this.settings);
		}

		this.addStyle();
		this.patch();
	}

	patch() {
		const [module, key] = Message;
		if (!module) return Logger.error("Message module not found");

		Patcher.after(module, key, (_, [props], ret) => {
			if (!props.childrenMessageContent.props.message) return ret;

			const isPinned = props.childrenMessageContent.props.message.pinned;

			if (!isPinned) return ret;
			if (!Array.isArray(ret.props.children.props.children)) return ret;
			if (props["data-list-item-id"].includes("pin")) return ret;

			ret.props.children.props.className += " pinned-message";

			if (!Pin) return ret;

			ret.props.children.props.children.push(
				<Pin
					className="pinned-message-icon"
					color="var(--interactive-normal)"
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

		if (messageSelectors && this.settings.backgroundEnabled) {
			const selector = `${messageSelectors.message}.pinned-message:not(${messageSelectors.mentioned}):not(${messageSelectors.replying})`;
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
