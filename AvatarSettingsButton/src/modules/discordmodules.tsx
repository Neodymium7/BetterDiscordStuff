import { expectClasses, expectSelectors } from "@lib/utils/webpack";

export const accountClasses = expectClasses("Account Classes", [
	"accountProfilePopoutWrapper",
	"container",
	"avatarWrapper",
]);

export const marginClasses = expectClasses("Margin Classes", ["marginTop20", "marginBottom8"]);

export const tooltipClasses = expectClasses("Tooltip Classes", [
	"tooltip",
	"tooltipTop",
	"tooltipPrimary",
	"tooltipPointer",
	"tooltipContent",
]);

export const layerContainerSelector = expectSelectors("Layer Container Class", ["layerContainer"])?.layerContainer;

export const appSelector = expectSelectors("App Class", ["appAsidePanelWrapper", "app"])?.app;
