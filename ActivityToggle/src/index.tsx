import { DOM, ReactUtils, Patcher, Webpack } from "betterdiscord";
import { DiscordSelectors, ReactComponents } from "zlibrary";
import Plugin from "zlibrary/plugin";
import ActivityToggleButton from "./components/ActivityToggleButton";

const {
	getModule,
	Filters: { byProps },
} = Webpack;

const { withTagAsButton } = getModule(byProps("withTagAsButton"));

export default class ActivityToggle extends Plugin {
	async onStart() {
		DOM.addStyle(`.${withTagAsButton} { min-width: 70px; }`);

		const Account = await ReactComponents.getComponent(
			"Account",
			DiscordSelectors.AccountDetails.container,
			(c) => c.prototype.renderNameZone
		);
		Patcher.after(Account.component.prototype, "render", (_thisObject, [_props], ret) => {
			ret.props.children[1].props.children.unshift(<ActivityToggleButton />);
		});
		ReactUtils.getInternalInstance(document.querySelector(Account.selector)).return.stateNode.forceUpdate();
	}

	onStop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
