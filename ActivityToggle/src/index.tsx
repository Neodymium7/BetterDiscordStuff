import { DOM, Patcher, ReactUtils } from "betterdiscord";
import Plugin from "zlibrary/plugin";
import { AccountSelectors } from "./modules";
import ActivityToggleButton from "./components/ActivityToggleButton";

export default class ActivityToggle extends Plugin {
	forceUpdate?: () => void;

	async onStart() {
		DOM.addStyle(`${AccountSelectors.withTagAsButton} { min-width: 70px; }`);

		const owner: any = ReactUtils.getOwnerInstance(document.querySelector(AccountSelectors.container));
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
