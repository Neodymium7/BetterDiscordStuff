import { Webpack } from "betterdiscord";

const {
	Filters: { byPrototypeFields },
	getModule,
} = Webpack;

const Tooltip = getModule(byPrototypeFields("renderTooltip"), { searchExports: true });

export default Tooltip;
