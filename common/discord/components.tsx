import { EmptyComponent, EmptyWrapperComponent, ErrorPopout } from "@lib/utils/react";
import { expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const Common = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.byKeys("Popout", "Avatar", "FormSwitch", "Tooltip"),
	name: "Common",
	fallback: {
		Popout: EmptyWrapperComponent,
		Avatar: EmptyComponent,
		FormSwitch: EmptyComponent,
		Tooltip: EmptyWrapperComponent,
		RadioGroup: EmptyComponent,
		FormItem: EmptyComponent,
		FormText: EmptyComponent,
		FormDivider: EmptyComponent,
	},
});

export const UserPopout = /* @__PURE__ */ expectModule({
	filter: (m) => m.toString?.().includes("UserProfilePopoutWrapper"),
	name: "UserPopout",
	fallback: ErrorPopout,
});
