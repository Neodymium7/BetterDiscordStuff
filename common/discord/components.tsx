import { EmptyWrapperComponent, ErrorPopout } from "@lib/utils/react";
import { expectModule } from "@lib/utils/webpack";
import { Webpack } from "betterdiscord";

export const Popout = /* @__PURE__ */ expectModule({
	filter: (m) => m.Animation && m.prototype.render,
	name: "Popout",
	fallback: EmptyWrapperComponent,
	searchExports: true,
});

export const UserPopout = /* @__PURE__ */ expectModule({
	filter: /* @__PURE__ */ Webpack.Filters.combine(
		/* @__PURE__ */ Webpack.Filters.byStrings("isNonUserBot", "onHide"),
		(m) => !m.toString?.().includes("sidebar")
	),
	name: "UserPopout",
	fallback: ErrorPopout,
});
