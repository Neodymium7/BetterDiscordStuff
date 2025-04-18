import { EmptyWrapperComponent, ErrorPopout } from "@lib/utils/react";
import { expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const Popout = /* @__PURE__ */ expectModule({
	filter: (m) => m.defaultProps && m.prototype.shouldShowPopout,
	name: "Popout",
	fallback: EmptyWrapperComponent,
	searchExports: true,
});

export const UserPopout = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.combine(
		/* @__PURE__ */ Webpack.Filters.byStrings("isNonUserBot", "onHide"),
		(m) => !m.toString?.().includes("Panel")
	),
	name: "UserPopout",
	fallback: ErrorPopout,
});
