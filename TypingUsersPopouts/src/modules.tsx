import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byStrings },
	getModule,
} = Webpack;

const { expectModule, store } = WebpackUtils;

const ErrorPopout = (props: { message: string }) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		{props.message}
	</div>
);

export const UserPopout = expectModule((e) => e.type?.toString().includes('"userId"'), {
	name: "UserPopout",
	fallback: (_props: any) => <ErrorPopout message="Error: User Popout module not found" />,
});

export const Popout = expectModule(byStrings(".animationPosition"), {
	searchExports: true,
	name: "Popout",
	fallback: (props: any) => props.children(),
});

export const loadProfile: any = expectModule<any>(
	(m) => m.Z?.toString?.().includes("y.apply(this,arguments)") && Object.values(m).length === 1,
	{ name: "loadProfile" }
).Z;

export const UserStore = getModule(store("UserStore"));
export const RelationshipStore = getModule(store("RelationshipStore"));
