import { Webpack } from "betterdiscord";
import { expectModule, expectClasses } from "@lib/utils/webpack";

const {
	Filters: { byKeys },
	getStore,
} = Webpack;

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const Common = expectModule({
	filter: byKeys("FormSwitch"),
	name: "Common",
	fallback: {
		FormSwitch: Error,
	},
});

export const roleMention = expectClasses("Role Mention Class", ["roleMention"]).roleMention.split(" ")[0];

export const GuildStore = getStore("GuildStore");
