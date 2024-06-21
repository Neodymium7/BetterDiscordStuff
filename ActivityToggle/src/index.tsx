import { DOM, Patcher, ReactUtils, Utils } from "betterdiscord";
import { AccountSelectors } from "./modules";
import ActivityToggleButton from "./components/ActivityToggleButton";

export default class ActivityToggle {
	forceUpdate?: () => void;

	async start() {
		DOM.addStyle(`${AccountSelectors.withTagAsButton} { min-width: 70px; }`);

		const owner: any = ReactUtils.getOwnerInstance(document.querySelector(AccountSelectors.container));
		const Account = owner._reactInternals.type;
		this.forceUpdate = owner.forceUpdate.bind(owner);

		Patcher.after(Account.prototype, "render", (_that, [_props], ret) => {
			const buttonContainerFilter = (i) =>
				Array.isArray(i?.props?.children) && i.props.children.some((e) => e?.props?.hasOwnProperty("selfMute"));

			const buttonContainer = Utils.findInTree(ret.props.children, buttonContainerFilter, {
				walkable: ["children", "props"],
			});
			buttonContainer.props.children.unshift(<ActivityToggleButton />);
		});

		this.forceUpdate();
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		this.forceUpdate?.();
	}
}
