import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byProps },
} = Webpack;

const { expectModule } = WebpackUtils;

interface TooltipClasses {
	tooltip: string;
	tooltipTop: string;
	tooltipPrimary: string;
	tooltipPointer: string;
	tooltipContent: string;
}

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

export const UserSettingsWindow: any = expectModule(byProps("saveAccountChanges"), {
	name: "UserSettingsWindow",
	fatal: true,
});

export const Sections = expectModule(byProps("ACCOUNT"), {
	searchExports: true,
	name: "Sections",
	fallback: { ACCOUNT: "Account" },
});

export const accountClasses = expectModule<AccountClasses>(byProps("buildOverrideButton"), {
	name: "Account Classes",
	fatal: true,
});
export const tooltipClasses = expectModule<TooltipClasses>(byProps("tooltipContent"), { name: "Tooltip Classes" });
export const layerContainerClass = expectModule<{ layerContainer: string }>(byProps("layerContainer"), {
	name: "layerContainer Class",
})?.layerContainer;
export const appClass = expectModule<{ app: string }>(byProps("appAsidePanelWrapper"), { name: "app Class" })?.app;

export const Margins = expectModule(byProps("marginXSmall"), {
	name: "Margins",
	fallback: {
		marginBottom8: "unknown-class",
		marginTop20: "unknown-class",
	},
});

export const RadioGroup = expectModule((m) => m.Sizes && m.toString().includes("radioItemClassName"), {
	searchExports: true,
	name: "RadioGroup",
	fallback: Error,
});

export const SwitchItem = expectModule((m) => m.toString?.().includes("().dividerDefault"), {
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const SettingsItem = expectModule((m) => m.render?.toString().includes("required"), {
	searchExports: true,
	name: "SettingsItem",
	fallback: Error,
});

export const SettingsNote = expectModule((m) => m.Types && m.toString().includes("selectable"), {
	searchExports: true,
	name: "SettingsNote",
	fallback: Error,
});

export const SettingsDivider = expectModule(
	(m) => m.toString?.().includes("().divider") && m.toString().includes("style"),
	{
		searchExports: true,
		name: "SettingsDivider",
		fallback: Error,
	}
);
