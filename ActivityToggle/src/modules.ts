import { Webpack } from "betterdiscord";
import { byType, expectModule } from "@lib/utils/webpack";
import React from "react";
import { EmptyComponent } from "@lib/utils/react";

export const PanelButton = expectModule({
	filter: (m) => m?.render?.toString().includes("tooltipText"),
	name: "PanelButton",
	fallback: EmptyComponent,
});

export const playSound = expectModule<(sound: string, volume: number) => void>({
	filter: Webpack.Filters.combine(
		Webpack.Filters.byStrings("Unable to find sound for pack name:"),
		byType("function")
	),
	name: "playSound",
	searchExports: true,
});

export const ShowCurrentGame = expectModule({
	filter: (m) => m.G6?.useSetting,
	name: "ShowCurrentGame",
	fallback: {
		G6: {
			useSetting: () => React.useState(true),
			updateSetting: undefined as ((...args: any) => void) | undefined,
		},
	},
})?.G6;

export const Account = expectModule<React.ComponentClass>({
	filter: Webpack.Filters.byPrototypeKeys("renderNameZone"),
	name: "Account",
	searchExports: true,
});
