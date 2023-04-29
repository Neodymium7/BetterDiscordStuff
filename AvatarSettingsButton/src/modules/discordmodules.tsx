import { Webpack } from "betterdiscord";
import { expectModule, getClasses, getSelectors } from "@lib/utils/webpack";

const {
	Filters: { byProps },
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

export const UserSettingsWindow: any = expectModule({
	filter: byProps("saveAccountChanges"),
	name: "UserSettingsWindow",
	fatal: true,
});

export const Sections = expectModule({
	filter: byProps("ACCOUNT"),
	searchExports: true,
	name: "Sections",
	fallback: { ACCOUNT: "Account" },
});

export const SettingsComponents = {
	RadioGroup: expectModule({
		filter: (m) => m.Sizes && m.toString().includes("radioItemClassName"),
		searchExports: true,
		name: "RadioGroup",
		fallback: Error,
	}),
	SwitchItem: expectModule({
		filter: (m) => m.toString?.().includes("().dividerDefault"),
		searchExports: true,
		name: "SwitchItem",
		fallback: Error,
	}),
	SettingsItem: expectModule({
		filter: (m) => m.render?.toString().includes("required"),
		searchExports: true,
		name: "SettingsItem",
		fallback: Error,
	}),
	SettingsNote: expectModule({
		filter: (m) => m.Types && m.toString().includes("selectable"),
		searchExports: true,
		name: "SettingsNote",
		fallback: Error,
	}),
	SettingsDivider: expectModule({
		filter: (m) => m.toString?.().includes("().divider") && m.toString().includes("style"),
		searchExports: true,
		name: "SettingsDivider",
		fallback: Error,
	}),
};

export const accountClasses = expectModule<AccountClasses>(byProps("buildOverrideButton"), {
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
