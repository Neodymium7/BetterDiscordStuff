import { Patcher, Webpack, Logger, Meta, Plugin } from "betterdiscord";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";
import { UserStore } from "@discord/stores";
import { Popout, UserPopout } from "@discord/components";
import { loadProfile } from "@discord/modules";

const {
	getWithKey,
	Filters: { byStrings },
} = Webpack;

const [Module, key] = getWithKey<AnyComponent>(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"));
if (!Module) Logger.error("Text area mention module not found.");

const onClick = (e: React.MouseEvent) => {
	e.preventDefault();
};

interface PopoutWrapperProps {
	id: string;
	guildId: string;
	channelId: string;
	children: React.ReactElement;
}

function PopoutWrapper({ id, guildId, channelId, children }: PopoutWrapperProps) {
	// Disable default click action
	children.props.onClick = onClick;

	const user = UserStore.getUser(id);

	return (
		<Popout
			align="left"
			position="top"
			key={user.id}
			renderPopout={(props: any) => (
				<UserPopout
					{...props}
					currentUser={UserStore.getCurrentUser()}
					user={user}
					guildId={guildId}
					channelId={channelId}
				/>
			)}
			preload={() => loadProfile?.(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })}
		>
			{(props: any) => <span {...props}>{children}</span>}
		</Popout>
	);
}

export default class ClickableTextMentions implements Plugin {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		this.patch();
	}

	patch() {
		if (!Module) return;

		Patcher.after(Module, key, (_, [props]: [any], ret) => {
			const original = ret.props.children;

			ret.props.children = (childrenProps: any) => {
				const mention = original(childrenProps).props.children;
				return <PopoutWrapper {...props}>{mention}</PopoutWrapper>;
			};
		});
	}

	stop() {
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
