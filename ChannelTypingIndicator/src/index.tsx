import { DOM, Logger, Meta, Patcher, Plugin, Utils, Webpack, WithKeyResult } from "betterdiscord";
import { Thread } from "./modules/discordmodules";
import { TextChannelTypingIndicator, ThreadTypingIndicator } from "./TypingIndicator";
import { Strings } from "./modules/utils";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";
import { waitForModuleWithKey } from "@lib/utils/webpack";

export default class ChannelTypingIndicator implements Plugin {
	meta: Meta;
	Channel!: WithKeyResult<AnyComponent>;
	moduleLoaded = false;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	async start() {
		Updater.checkForUpdates(this.meta);
		Strings.subscribe();
		DOM.addStyle(".channelTypingIndicator { margin-left: 8px; display: flex; align-items: center; }");
		this.patchThread();
		await this.getModule();
		this.patchChannel();
	}

	async getModule() {
		if (this.moduleLoaded) return;

		this.Channel = [
			...(await waitForModuleWithKey<AnyComponent>(Webpack.Filters.byStrings("UNREAD_LESS_IMPORTANT"))),
		];

		const [module] = this.Channel;
		if (!module) Logger.error("Channel module not found");

		this.moduleLoaded = true;
	}

	patchChannel() {
		if (!this.Channel) return;
		Patcher.after(...this.Channel, (_, [props], ret) => {
			const target = Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"],
			});
			target.children.push(
				<TextChannelTypingIndicator channelId={props.channel.id} guildId={props.channel.guild_id} />
			);
		});
	}

	patchThread() {
		if (!Thread) return;
		Patcher.after(Thread, "type", (_, [props], ret) => {
			const target = Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"],
			});
			target.children.push(<ThreadTypingIndicator channelId={props.thread.id} guildId={props.thread.guild_id} />);
		});
	}

	stop() {
		Strings.unsubscribe();
		DOM.removeStyle();
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
