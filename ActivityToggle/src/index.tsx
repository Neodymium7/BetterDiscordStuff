import { DOM, Meta, Patcher, Plugin, Utils } from "betterdiscord";
import ActivityToggleButton from "./components/ActivityToggleButton";
import { Updater } from "@lib";
import { Account } from "./modules";

export default class ActivityToggle implements Plugin {
	meta: Meta;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	start() {
		Updater.checkForUpdates(this.meta);
		this.patch();
	}

	patch() {
		if (!Account) return;

		let ButtonsComponent: ((props: any) => React.ReactElement) | null = null;

		const Wrapper = (props: any) => {
			if (!ButtonsComponent) return null;

			const buttonsRet = ButtonsComponent(props);
			buttonsRet.props.children.unshift(<ActivityToggleButton />);
			return buttonsRet;
		};

		Patcher.after(Account.prototype, "render", (_that, _args, ret) => {
			const children = ret.props.children;

			ret.props.children = (childrenProps: any) => {
				const childrenRet = children(childrenProps);

				const buttonsFilter = (e: any) =>
					e?.props?.hasOwnProperty("selfMute") && !e?.props?.hasOwnProperty("renderNameTag");
				const containerFilter = (i: any) =>
					Array.isArray(i?.props?.children) && i.props.children.some(buttonsFilter);

				const container = Utils.findInTree(childrenRet.props.children, containerFilter, {
					walkable: ["children", "props"],
				});

				const buttonsIndex = container.props.children.findIndex(buttonsFilter);
				const buttons = container.props.children[buttonsIndex];
				if (!ButtonsComponent) ButtonsComponent = buttons.type;

				container.props.children.splice(buttonsIndex, 1, <Wrapper {...buttons.props} />);

				return childrenRet;
			};
		});
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		Updater.closeNotice();
	}
}
