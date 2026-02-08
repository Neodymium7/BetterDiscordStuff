import { expectClasses, expectSelectors } from "@lib/utils/webpack";

export const accountClasses = expectClasses("Account Classes", ["nameTag", "container", "accountPopoutButtonWrapper"]);

export const tooltipClasses = expectClasses("Tooltip Classes", [
	"tooltip",
	"tooltipTop",
	"tooltipPrimary",
	"tooltipPointer",
	"tooltipContent",
	"tooltipPointerBg",
]);

export const layerContainerSelector = expectSelectors("Layer Container Class", [
	"layerContainer",
	"clickTrapContainer",
])?.layerContainer;

export const appSelector = expectSelectors("App Class", ["appAsidePanelWrapper", "app"])?.app;
