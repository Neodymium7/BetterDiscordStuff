import { EmptyWrapperComponent, ErrorPopout } from "@lib/utils/react";
import { expectModule } from "@lib/utils/webpack";

export const Popout = /* @__PURE__ */ expectModule({
	filter: (m) => m.defaultProps && m.Animation?.TRANSLATE,
	name: "Popout",
	fallback: EmptyWrapperComponent,
	searchExports: true,
});

export const UserPopout = /* @__PURE__ */ expectModule({
	filter: (m) => m.toString?.().includes("UserProfilePopoutWrapper"),
	name: "UserPopout",
	fallback: ErrorPopout,
});
