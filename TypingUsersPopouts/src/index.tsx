import { DOM, Patcher, Utils, Meta } from "betterdiscord";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import {
	Common,
	RelationshipStore,
	UserPopout,
	UserStore,
	loadProfile,
	typingSelector,
	TypingUsersContainer,
} from "./modules";

const nameSelector = `${typingSelector} strong`;

export default class TypingUsersPopouts {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		showChangelog(changelog, this.meta);
		DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
		this.patch();
	}

	patch() {
		const patchType = (props, ret) => {
			const text = Utils.findInTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong", {
				walkable: ["props", "children"],
			});
			if (!text) return;

			const typingUsersIds = Object.keys(props.typingUsers).filter(
				(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
			);
			const channel = props.channel;
			const guildId = channel.guild_id;

			let i = 0;
			text.children = text.children.map((e) => {
				if (e.type !== "strong") return e;

				const user = UserStore.getUser(typingUsersIds[i++]);

				return (
					<Common.Popout
						align="left"
						position="top"
						key={user.id}
						renderPopout={(props) => (
							<UserPopout {...props} userId={user.id} guildId={guildId} channelId={channel.id} />
						)}
						preload={() =>
							loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId: channel.id })
						}
					>
						{(props) => <strong {...props} {...e.props} />}
					</Common.Popout>
				);
			});
		};

		let patchedType;

		Patcher.after(TypingUsersContainer, "Z", (_, __, containerRet) => {
			if (patchedType) {
				containerRet.type = patchedType;
				return containerRet;
			}

			const original = containerRet.type;

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
