import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byStrings },
} = Webpack;

const { expectModule, getStore, getSelectors } = WebpackUtils;

const ErrorPopout = (props: { message: string }) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		{props.message}
	</div>
);

export const UserPopout = expectModule({
	filter: (e) => e.type?.toString().includes('"userId"'),
	name: "UserPopout",
	fallback: (_props: any) => <ErrorPopout message="Error: User Popout module not found" />,
});

export const Popout = expectModule({
	filter: byStrings(".animationPosition"),
	searchExports: true,
	name: "Popout",
	fallback: (props: any) => props.children(),
});

export const loadProfile: any = expectModule<any>({
	filter: (m) => m.Z?.toString?.().includes("y.apply(this,arguments)") && Object.values(m).length === 1,
	name: "loadProfile",
}).Z;

export const typingSelector = getSelectors("Typing Class", ["typingDots", "typing"]).typing;

export const UserStore = getStore("UserStore");
export const RelationshipStore = getStore("RelationshipStore");
