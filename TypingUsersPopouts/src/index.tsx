import { Webpack, DOM, Patcher } from "betterdiscord";
import { DiscordModules, DiscordSelectors, ReactComponents, Utilities } from "zlibrary";
import Plugin from "zlibrary/plugin";

const {
	Filters: { byStrings },
	getModule,
} = Webpack;

const UserPopout = getModule((e) => e.type?.toString().includes('"userId"'));
const Popout = getModule(byStrings(".animationPosition"));
const loadProfile = getModule(byStrings("T.apply(this,arguments)"));

const nameSelector = `${DiscordSelectors.Typing.typing} strong`;

const { UserStore, RelationshipStore } = DiscordModules;

export default class TypingUsersPopouts extends Plugin {
	onStart() {
		DOM.addStyle(`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`);
		this.patch();
	}

	async patch() {
		const TypingUsers = await ReactComponents.getComponent(
			"TypingUsers",
			DiscordSelectors.Typing.typing,
			(c) => c.prototype?.getCooldownTextStyle
		);
		Patcher.after(TypingUsers.component.prototype, "render", (thisObject: any, _, ret) => {
			const typingUsersIds = Object.keys(thisObject.props.typingUsers).filter(
				(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
			);
			const text = Utilities.findInReactTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong");
			if (!text) return ret;

			let i = 0;
			text.children = text.children.map((e) => {
				if (e.type !== "strong") return e;

				const user = UserStore.getUser(typingUsersIds[i++]);
				const channel = thisObject.props.channel;
				const guildId = channel.guild_id;

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
