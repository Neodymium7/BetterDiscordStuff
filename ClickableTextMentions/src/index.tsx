import { Patcher, Webpack, Logger } from "betterdiscord";
import { Popout, loadProfile, UserPopout, UserStore } from "./modules";

const {
	getWithKey,
	Filters: { byStrings },
} = Webpack;

const [Module, key] = getWithKey(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"));
if (!Module) Logger.error("Text area mention module not found.");

const onClick = (e: React.MouseEvent) => {
	e.preventDefault();
};

function PopoutWrapper({ id, guildId, channelId, children }) {
	// Disable default click action
	children.props.onClick = onClick;

	const user = UserStore.getUser(id);

	return (
		<Popout
			align="left"
			position="top"
			key={user.id}
			renderPopout={(props) => <UserPopout {...props} userId={user.id} guildId={guildId} channelId={channelId} />}
			preload={() => loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })}
		>
			{(props) => <span {...props}>{children}</span>}
		</Popout>
	);
}

export default class ClickableTextMentions {
	start() {
		if (!Module) return;

		Patcher.after(Module, key, (_, [props]: [any], ret) => {
			const original = ret.props.children;

			ret.props.children = (childrenProps) => {
				const mention = original(childrenProps).props.children;
				return <PopoutWrapper {...props}>{mention}</PopoutWrapper>;
			};
		});
	}

	stop() {
		Patcher.unpatchAll();
	}
}
