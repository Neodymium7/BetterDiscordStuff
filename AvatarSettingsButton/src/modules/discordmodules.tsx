import { Webpack } from "betterdiscord";
import { expectModule, getClasses, getSelectors } from "@lib/utils/webpack";

const {
	Filters: { byKeys },
} = Webpack;

interface AccountClasses {
	container: string;
	avatarWrapper: string;
	withTagAsButton: string;
}

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const Common = expectModule({
	filter: byKeys("FormSwitch", "RadioGroup", "FormItem", "FormText", "FormDivider"),
	name: "Common",
	fallback: {
		FormSwitch: Error,
		RadioGroup: Error,
		FormItem: Error,
		FormText: Error,
		FormDivider: Error,
	},
});

export const UserSettingsWindow: any = expectModule({
	filter: byKeys("saveAccountChanges"),
	name: "UserSettingsWindow",
	fatal: true,
});

export const Sections = expectModule({
	filter: byKeys("ACCOUNT", "CHANGE_LOG"),
	searchExports: true,
	name: "Sections",
	fallback: { ACCOUNT: "My Account" },
});

console.log(Sections);

export const accountClasses = expectModule<AccountClasses>(byKeys("buildOverrideButton"), {
	name: "Account Classes",
	fatal: true,
});

export const Margins = getClasses("Margins", ["marginTop20", "marginBottom8"]);

export const tooltipClasses = getClasses("Tooltip Classes", [
	"tooltip",
	"tooltipTop",
	"tooltipPrimary",
	"tooltipPointer",
	"tooltipContent",
]);

export const layerContainerSelector = getSelectors("Layer Container Class", ["layerContainer"]).layerContainer;

export const appSelector = getSelectors("App Class", ["appAsidePanelWrapper", "app"]).app;
