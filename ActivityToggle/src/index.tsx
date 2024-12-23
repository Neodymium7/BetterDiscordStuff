import { DOM, Meta, Patcher, Plugin, ReactUtils, Utils } from "betterdiscord";
import { AccountSelectors } from "./modules";
import ActivityToggleButton from "./components/ActivityToggleButton";
import { Updater } from "@lib/updater";

export default class ActivityToggle implements Plugin {
	forceUpdate?: () => void;
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		if (AccountSelectors) DOM.addStyle(`${AccountSelectors.avatarWrapper} { min-width: 70px; }`);
		this.patch();
	}

	patch() {
		if (!AccountSelectors) return;
		const element = document.querySelector(AccountSelectors.container);
		if (!element) return;
		const owner: any = ReactUtils.getOwnerInstance(element as HTMLElement);
		if (!owner) return;
		const Account = owner._reactInternals.type;
		this.forceUpdate = owner.forceUpdate.bind(owner);

		Patcher.after(Account.prototype, "render", (_that, _args, ret) => {
			const buttonContainerFilter = (i: any) =>
				Array.isArray(i?.props?.children) &&
				i.props.children.some((e: any) => e?.props?.hasOwnProperty("selfMute"));

			const buttonContainer = Utils.findInTree(ret.props.children, buttonContainerFilter, {
				walkable: ["children", "props"],
			});
			buttonContainer.props.children.unshift(<ActivityToggleButton />);
		});

		this.forceUpdate?.();
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		this.forceUpdate?.();
		Updater.closeNotice();
	}
}
