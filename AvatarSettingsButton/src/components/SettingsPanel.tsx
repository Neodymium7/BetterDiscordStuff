import { Webpack } from "betterdiscord";
import { Settings } from "../utils";

const {
	getModule,
	Filters: { byProps }
} = Webpack;

const Margins = getModule(byProps("marginXSmall"));
const RadioGroup = getModule((m) => m.Sizes && m.toString().includes("radioItemClassName"));
const SwitchItem = getModule((m) => m.toString().includes("helpdeskArticleId"));
const SettingsItem = getModule((m) => m.render?.toString().includes("required"));
const SettingsNote = getModule((m) => m.Types && m.toString().includes("selectable"));
const SettingsDivider = getModule((m) => m.toString().includes("().divider"));

export default function SettingsPanel() {
	const settings = Settings.useSettingsState();

	return (
		<>
			<SettingsItem title="Click">
				<SettingsNote className={Margins.marginBottom8} type="description">
					What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can
					use the Ctrl + , shortcut.
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: "Settings (Default)", value: 1 },
						{ name: "Settings Context Menu", value: 2 },
						{ name: "Status Picker", value: 3 },
						{ name: "Nothing", value: 0 }
					]}
					onChange={({ value }) => (Settings.click = value)}
					value={settings.click}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SettingsItem title="Right Click" className={Margins.marginTop20}>
				<SettingsNote className={Margins.marginBottom8} type="description">
					What opens when right clicking on the user avatar.
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: "Settings", value: 1 },
						{ name: "Settings Context Menu", value: 2 },
						{ name: "Status Picker (Default)", value: 3 },
						{ name: "Nothing", value: 0 }
					]}
					onChange={({ value }) => (Settings.contextmenu = value)}
					value={settings.contextmenu}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SettingsItem title="Middle Click" className={Margins.marginTop20}>
				<SettingsNote className={Margins.marginBottom8} type="description">
					What opens when middle clicking on the username.
				</SettingsNote>
				<RadioGroup
					options={[
						{ name: "Settings", value: 1 },
						{ name: "Settings Context Menu (Default)", value: 2 },
						{ name: "Status Picker", value: 3 },
						{ name: "Nothing", value: 0 }
					]}
					onChange={({ value }) => (Settings.middleclick = value)}
					value={settings.middleclick}
				/>
				<SettingsDivider className={Margins.marginTop20} />
			</SettingsItem>
			<SwitchItem
				className={Margins.marginTop20}
				children="Tooltip"
				note="Show tooltip when hovering over user avatar."
				onChange={(v: boolean) => (Settings.showTooltip = v)}
				value={settings.showTooltip}
			/>
		</>
	);
}
