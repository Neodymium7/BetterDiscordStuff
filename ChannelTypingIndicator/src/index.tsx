import { DOM, Meta, Patcher, Plugin, Utils } from "betterdiscord";
import { Channel, Thread } from "./modules/discordmodules";
import { TypingIndicator } from "./TypingIndicator";
import { Strings } from "./modules/utils";
import { Updater } from "@lib/updater";

export default class ChannelTypingIndicator implements Plugin {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		Strings.subscribe();
		DOM.addStyle(".channelTypingIndicator { margin-left: 8px; display: flex; align-items: center; }");
		this.patchChannel();
		this.patchThread();
	}

	patchChannel() {
		if (!Channel) return;
		const [module, key] = Channel;
		Patcher.after(module, key, (_, [props], ret) => {
			const target = Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"],
			});
			target.children.push(<TypingIndicator channelId={props.channel.id} guildId={props.channel.guild_id} />);
		});
	}

	patchThread() {
		if (!Thread) return;
		Patcher.after(Thread, "type", (_, [props], ret) => {
			const target = Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"],
			});
			target.children.push(<TypingIndicator channelId={props.thread.id} guildId={props.thread.guild_id} />);
		});
	}

	stop() {
		Strings.unsubscribe();
		DOM.removeStyle();
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
