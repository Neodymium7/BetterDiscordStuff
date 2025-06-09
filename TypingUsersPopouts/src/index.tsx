import { DOM, Patcher, Utils, Meta, Plugin, Changes } from "betterdiscord";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import { typingSelector, TypingUsersContainer } from "./modules";
import { RelationshipStore, TypingStore, UserStore } from "@discord/stores";
import { UserPopoutWrapper } from "@lib/components";

const nameSelector = `${typingSelector} strong`;

export default class TypingUsersPopouts implements Plugin {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog as Changes[], this.meta);
		DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
		this.patch();
	}

	patch() {
		if (!TypingUsersContainer) return;

		const patchType = (props: any, ret: any) => {
			const text = Utils.findInTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong", {
				walkable: ["props", "children"],
			});
			if (!text) return;

			const channel = props.channel;
			const guildId = channel.guild_id;

			const typingUsersIds = Object.keys(TypingStore.getTypingUsers(channel.id)).filter(
				(id) =>
					id !== UserStore.getCurrentUser().id &&
					!RelationshipStore.isBlocked(id) &&
					!RelationshipStore.isIgnored(id)
			);

			let i = 0;
			text.children = text.children.map((e: React.ReactElement) => {
				if (e.type !== "strong") return e;

				const user = UserStore.getUser(typingUsersIds[i++]);

				return (
					<UserPopoutWrapper id={user.id} guildId={guildId} channelId={channel.id}>
						{e}
					</UserPopoutWrapper>
				);
			});
		};

		let patchedType: ((props: any) => React.ReactNode) | undefined;

		Patcher.after(...TypingUsersContainer, (_, __, containerRet) => {
			if (patchedType) {
				containerRet.type = patchedType;
				return containerRet;
			}

			const original = containerRet.type as React.FunctionComponent<any>;

			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};

			containerRet.type = patchedType;
		});
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
