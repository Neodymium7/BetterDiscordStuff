import { DOM, Patcher, Utils, Webpack } from "betterdiscord";
import Plugin from "zlibrary/plugin";
import { WebpackUtils } from "bundlebd";
import { Popout, RelationshipStore, UserPopout, UserStore, loadProfile, typingSelector } from "./modules";

const {
	Filters: { byStrings },
} = Webpack;

const { getModuleWithKey } = WebpackUtils;

const findChildComponent = async (module: any, functionName: string, filter: (i: any) => boolean) => {
	return new Promise<any>((resolve, reject) => {
		const unpatch = Patcher.after(module, functionName, (_, __, ret) => {
			const found = Utils.findInTree(ret, (i) => filter(i));
			found ? resolve(found) : reject("No item found matching filter");
			unpatch();
		});
	});
};

const nameSelector = `${typingSelector} strong`;

export default class TypingUsersPopouts extends Plugin {
	onStart() {
		DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
		this.patch();
	}

	async patch() {
		const [TypingUsersContainer, key] = getModuleWithKey(byStrings("typingUsers:"));
		const TypingUsers = await findChildComponent(TypingUsersContainer, key, (i) => i.prototype?.render);

		Patcher.after(TypingUsers.prototype, "render", (that: any, _, ret) => {
			const text = Utils.findInTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong", {
				walkable: ["props", "children"],
			});
			if (!text) return ret;

			const typingUsersIds = Object.keys(that.props.typingUsers).filter(
				(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
			);
			const channel = that.props.channel;
			const guildId = channel.guild_id;

			let i = 0;
			text.children = text.children.map((e) => {
				if (e.type !== "strong") return e;

				const user = UserStore.getUser(typingUsersIds[i++]);

				return (
					<Popout
						align="left"
						position="top"
						key={user.id}
						renderPopout={() => <UserPopout userId={user.id} guildId={guildId} channelId={channel.id} />}
						preload={() =>
							loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId: channel.id })
						}
					>
						{(props) => <strong {...props} {...e.props} />}
					</Popout>
				);
			});
		});
	}

	onStop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
