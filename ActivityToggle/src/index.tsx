import { DOM, Patcher, ReactUtils } from "betterdiscord";
import { DiscordSelectors } from "zlibrary";
import Plugin from "zlibrary/plugin";
import { withTagAsButton } from "./modules";
import ActivityToggleButton from "./components/ActivityToggleButton";

export default class ActivityToggle extends Plugin {
	forceUpdate?: () => void;

	async onStart() {
		DOM.addStyle(`${withTagAsButton} { min-width: 70px; }`);

		const owner: any = ReactUtils.getOwnerInstance(
			document.querySelector(DiscordSelectors.AccountDetails.container)
		);
		const Account = owner._reactInternals.type;
		this.forceUpdate = owner.forceUpdate.bind(owner);

		Patcher.after(Account.prototype, "render", (_that, [_props], ret) => {
			ret.props.children[1].props.children.unshift(<ActivityToggleButton />);
		});

		this.forceUpdate();
	}

	onStop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		this.forceUpdate?.();
	}
}
