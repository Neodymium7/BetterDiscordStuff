import { Webpack } from "betterdiscord";

const {
	Filters: { byPrototypeFields },
	getModule
} = Webpack;

const Tooltip = getModule(byPrototypeFields("renderTooltip"));

export default Tooltip;
