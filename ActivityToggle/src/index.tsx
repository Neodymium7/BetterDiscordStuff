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
			const buttonContainerFilter = (i) =>
				Array.isArray(i?.props?.children) &&
				i?.props.children.some((e) => e?.props?.hasOwnProperty("selfMute"));

			const buttonContainer = BdApi.Utils.findInTree(ret.props.children, buttonContainerFilter, {
				walkable: ["children", "props"],
			});
			buttonContainer.props.children.unshift(<ActivityToggleButton />);
		});

		this.forceUpdate();
	}

	onStop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		this.forceUpdate?.();
	}
}
