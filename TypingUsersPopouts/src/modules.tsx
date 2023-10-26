import { Webpack } from "betterdiscord";
import { expectModule, getStore, getSelectors } from "@lib/utils/webpack";

const {
	Filters: { byStrings, byProps },
} = Webpack;

const ErrorPopout = (props: { message: string }) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		{props.message}
	</div>
);

export const TypingUsersContainer: any = expectModule({
	filter: (m) => m.default?.toString?.().includes("typingUsers:"),
	name: "TypingUsersContainer",
	fatal: true,
});

export const UserPopout = expectModule({
	filter: (m) => m.type?.toString?.().includes('"Unexpected missing user"'),
	name: "UserPopout",
	fallback: (_props: any) => <ErrorPopout message="Error: User Popout module not found" />,
});

export const Common = expectModule({
	filter: byProps("Popout"),
	name: "Common",
	fallback: {
		Popout: (props: any) => props.children(),
	},
});

export const loadProfile: any = expectModule<any>({
	filter: byStrings("preloadUserBanner"),
	name: "loadProfile",
});

export const typingSelector = getSelectors("Typing Class", ["typingDots", "typing"]).typing;

export const UserStore = getStore("UserStore");
export const RelationshipStore = getStore("RelationshipStore");
