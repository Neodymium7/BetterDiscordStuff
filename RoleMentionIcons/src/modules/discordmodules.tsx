import { Webpack } from "betterdiscord";
import { expectModule, getStore, getClasses } from "@lib/utils/webpack";

const {
	Filters: { byProps },
} = Webpack;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const Common = expectModule({
	filter: byProps("FormSwitch"),
	name: "Common",
	fallback: {
		FormSwitch: Error,
	},
});

export const roleMention = getClasses("Role Mention Class", ["roleMention"]).roleMention.split(" ")[0];

export const GuildStore = getStore("GuildStore");
