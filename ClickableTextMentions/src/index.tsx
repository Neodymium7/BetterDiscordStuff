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

export default class ClickableTextMentions {
	start() {
		if (!Module) return;

		Patcher.after(Module, key, (_, [props]: [any], ret) => {
			const { guildId, channelId } = props;
			const user = UserStore.getUser(props.id);

			const original = ret.props.children;

			ret.props.children = (childrenProps) => {
				const childrenRet = original(childrenProps);
				const mention = childrenRet.props.children;
				const text = mention.props.children;

				// Disable default click action and give interactive style
				mention.props.onClick = onClick;

				mention.props.children = (
					<Popout
						align="left"
						position="top"
						key={user.id}
						renderPopout={() => <UserPopout userId={user.id} guildId={guildId} channelId={channelId} />}
						preload={() => loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })}
					>
						{(props) => <span {...props}>{text}</span>}
					</Popout>
				);

				// Remove tooltip component, w/ wrapper for plugin compatibility
				return <>{mention}</>;
			};
		});
	}

	stop() {
		Patcher.unpatchAll();
	}
}
