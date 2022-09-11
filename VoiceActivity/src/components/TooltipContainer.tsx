import { Webpack } from "betterdiscord";

const {
	Filters: { byProps },
	getModule
} = Webpack;

const { TooltipContainer } = getModule(byProps("TooltipContainer"));

export default TooltipContainer;
