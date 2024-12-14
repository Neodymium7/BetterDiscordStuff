import { DOM, Meta, Patcher, ReactUtils, Utils } from "betterdiscord";
import { AccountSelectors } from "./modules";
import ActivityToggleButton from "./components/ActivityToggleButton";
import { Updater } from "@lib/updater";

export default class ActivityToggle {
	forceUpdate?: () => void;
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		DOM.addStyle(`${AccountSelectors.avatarWrapper} { min-width: 70px; }`);
		this.patch();
	}

	patch() {
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
		Updater.closeNotice();
	}
}
