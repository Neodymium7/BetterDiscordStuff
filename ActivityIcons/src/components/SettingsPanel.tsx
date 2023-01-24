import { Webpack } from "betterdiscord";
import { Settings } from "../utils";

const {
	getModule,
	Filters: { byProps },
} = Webpack;

const Margins = getModule(byProps("marginXSmall"));
const RadioGroup = getModule((m) => m.Sizes && m.toString().includes("radioItemClassName"), { searchExports: true });
const SettingsItem = getModule((m) => m.render?.toString().includes("required"), { searchExports: true });
const SettingsNote = getModule((m) => m.Types && m.toString().includes("selectable"), { searchExports: true });

export default function SettingsPanel() {
	const settings = Settings.useSettingsState();

	return (
		<SettingsItem title="Normal Activity Icon Behavior">
			<SettingsNote className={Margins.marginBottom8} type="description">
				Conditions under which normal activity icon (game controller) will be displayed
			</SettingsNote>
			<RadioGroup
				options={[
					{ name: "Normal Activity (Default)", value: 0 },
					{ name: "Custom Status and Normal Activity", value: 1 },
					{ name: "Never", value: 2 },
				]}
				onChange={({ value }) => (Settings.normalIconBehavior = value)}
				value={settings.normalIconBehavior}
			/>
		</SettingsItem>
	);
}
