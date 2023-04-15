import { Webpack } from "betterdiscord";
import { Settings, Strings } from "../utils";

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
		<SettingsItem title={Strings.SETTINGS_ICON_BEHAVIOR}>
			<SettingsNote className={Margins.marginBottom8} type="description">
				{Strings.SETTINGS_ICON_BEHAVIOR_NOTE}
			</SettingsNote>
			<RadioGroup
				options={[
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_ACTIVITY, value: 0 },
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_STATUS_AND_ACTIVITY, value: 1 },
					{ name: Strings.SETTINGS_ICON_BEHAVIOR_NEVER, value: 2 },
				]}
				onChange={({ value }) => (Settings.normalIconBehavior = value)}
				value={settings.normalIconBehavior}
			/>
		</SettingsItem>
	);
}
