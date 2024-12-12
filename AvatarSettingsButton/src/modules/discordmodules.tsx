import { Webpack } from "betterdiscord";
import { expectModule, expectClasses, expectSelectors } from "@lib/utils/webpack";

const {
	Filters: { byKeys },
} = Webpack;

interface AccountClasses {
	container: string;
	avatarWrapper: string;
	accountProfilePopoutWrapper: string;
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

export const accountClasses = expectModule<AccountClasses>({
	filter: byKeys("accountProfilePopoutWrapper"),
	name: "Account Classes",
	fatal: true,
});

export const Margins = expectClasses("Margins", ["marginTop20", "marginBottom8"]);

export const tooltipClasses = expectClasses("Tooltip Classes", [
	"tooltip",
	"tooltipTop",
	"tooltipPrimary",
	"tooltipPointer",
	"tooltipContent",
]);

export const layerContainerSelector = expectSelectors("Layer Container Class", ["layerContainer"]).layerContainer;

export const appSelector = expectSelectors("App Class", ["appAsidePanelWrapper", "app"]).app;
