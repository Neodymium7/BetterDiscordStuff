import { DOM, Patcher, Webpack, Logger, UI, Data } from "betterdiscord";
import { getSelectors, getIcon } from "@lib/utils/webpack";

const { getModule } = Webpack;

const Pin = getIcon("M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5");
const Message = getModule((m) => m.Z?.toString?.().includes("childrenRepliedMessage"));
const messageSelectors = getSelectors("message", "mentioned", "replying");

if (!Message) Logger.error("Message module not found");
if (!Pin) Logger.error("Pin icon not found.");
if (!messageSelectors) Logger.error("Message selectors icon not found.");

export default class PinnedMessageIcons {
	settings: { backgroundEnabled: boolean };

	start() {
		if (!Message) return;

		this.settings = Data.load("settings");
		if (!this.settings) {
			this.settings = { backgroundEnabled: true };
			Data.save("settings", this.settings);
		}

		this.addStyle();
		this.patch();
	}

	patch() {
		Patcher.after(Message, "Z", (_, [props]: [any], ret) => {
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
		let style = ".pinned-message-icon { position: absolute; bottom: calc(50% - 10px); right: 16px; }";

		if (messageSelectors && this.settings.backgroundEnabled) {
			const selector = `${messageSelectors.message}.pinned-message:not(${messageSelectors.mentioned}):not(${messageSelectors.replying})`;
			style += `${selector}::after { content: ""; position: absolute; display: block; width: inherit; height: inherit; left: 0px; bottom: 0px; right: 0px; top: 0px; background: var(--channels-default); opacity: 0.08; z-index: -1; } ${selector}::before { content: ""; position: absolute; display: block; width: 2px; height: inherit; left: 0px; bottom: 0px; top: 0px; background: var(--channels-default); }`;
		}

		DOM.addStyle(style);
	}

	stop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
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
			onChange: (_, id, value) => {
				this.settings[id] = value;
				DOM.removeStyle();
				this.addStyle();
				Data.save("settings", this.settings);
			},
		});
	}
}
