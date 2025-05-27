import { Patcher, Webpack, Logger, Meta, Plugin } from "betterdiscord";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";
import { UserPopoutWrapper } from "@lib/components";

const {
	getWithKey,
	Filters: { byStrings },
} = Webpack;

const [Module, key] = getWithKey<AnyComponent>(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"));
if (!Module) Logger.error("Text area mention module not found.");

const onClick = (e: React.MouseEvent) => {
	e.preventDefault();
};

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

				// Disable default click action
				mention.props.onClick = onClick;

				return <UserPopoutWrapper {...props}>{mention}</UserPopoutWrapper>;
			};
		});
	}

	stop() {
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
