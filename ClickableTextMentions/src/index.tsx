import { Patcher, Webpack, Logger } from "betterdiscord";
import { Updater } from "@lib";
import { AnyComponent } from "@lib/utils/react";
import { UserPopoutWrapper } from "@lib/components";
import { WithKeyResult } from "@lib/utils/webpack";

const {
	getWithKey,
	getModule,
	Filters: { byStrings, bySource },
} = Webpack;

const [Module, key] = getWithKey(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"), {
	target: getModule<any>(bySource(".hidePersonalInformation", "#", "<@", ".discriminator"), { raw: true })
		?.declarations,
}) as unknown as WithKeyResult<AnyComponent>;
if (!Module) Logger.error("Text area mention module not found.");

const onClick = (e: React.MouseEvent) => {
	e.preventDefault();
};

export default class ClickableTextMentions {
	meta: BetterDiscord.Addon;

	constructor(meta: BetterDiscord.Addon) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		this.patch();
	}

	patch() {
		if (!Module) return;

		Patcher.after(Module, key, (_, [props]: [any], ret) => {
			const mention = ret.props.children?.props?.children;

			if (!mention) return ret;

			// Disable default click action
			mention.props.onClick = onClick;

			return <UserPopoutWrapper {...props}>{ret.props.children}</UserPopoutWrapper>;
		});
	}

	stop() {
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
