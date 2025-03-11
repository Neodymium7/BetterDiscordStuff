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

		let buttonsComponent: ((props: any) => React.ReactElement) | null = null;

		const Wrapper = (props: any) => {
			if (!buttonsComponent) return null;

			const buttonsRet = buttonsComponent(props);
			buttonsRet.props.children.unshift(<ActivityToggleButton />);
			return buttonsRet;
		};

		Patcher.after(Account.prototype, "render", (_that, _args, ret) => {
			const buttonsFilter = (e: any) => e?.props?.hasOwnProperty("selfMute");
			const containerFilter = (i: any) =>
				Array.isArray(i?.props?.children) && i.props.children.some(buttonsFilter);

			const container = Utils.findInTree(ret.props.children, containerFilter, {
				walkable: ["children", "props"],
			});
			const buttonsIndex = container.props.children.findIndex(buttonsFilter);
			const buttons = container.props.children[buttonsIndex];
			if (!buttonsComponent) buttonsComponent = buttons.type;

			container.props.children.splice(buttonsIndex, 1, <Wrapper {...buttons.props} />);
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
