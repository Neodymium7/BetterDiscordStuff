import { Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";

const {
	Filters: { byProps },
	getModule,
} = Webpack;

const { expectModule, store } = WebpackUtils;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const roleMention = expectModule<{ roleMention: string }>(byProps("roleMention"), {
	name: "Role Mention Class",
	fatal: true,
}).roleMention.split(" ")[0];

export const SwitchItem = expectModule((m) => m.toString?.().includes("().dividerDefault"), {
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const GuildStore = getModule(store("GuildStore"));
