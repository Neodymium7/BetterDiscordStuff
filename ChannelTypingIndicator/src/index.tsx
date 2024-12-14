import { DOM, Patcher, Utils } from "betterdiscord";
import { Channel, Thread } from "./modules/discordmodules";
import { TypingIndicator } from "./TypingIndicator";
import { Strings } from "./modules/utils";

export default class ChannelTypingIndicator {
	start() {
		Strings.subscribe();
		DOM.addStyle(".channelTypingIndicator { margin-left: 8px; display: flex; align-items: center; }");
		this.patchChannel();
		this.patchThread();
	}

	patchChannel() {
		Patcher.after(Channel, "Z", (_, [props]: [any], ret) => {
			const target = Utils.findInTree(ret, (x) => x?.className?.includes("linkTop"), {
				walkable: ["props", "children"],
			});
			target.children.push(<TypingIndicator channelId={props.channel.id} guildId={props.channel.guild_id} />);
		});
	}

	patchThread() {
		Patcher.after(Thread, "type", (_, [props]: [any], ret) => {
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
	}
}
