import { Margins, Common } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";

const { RadioGroup, FormItem, FormText, FormDivider, FormSwitch } = Common;

export default function SettingsPanel() {
	const settings = Settings.useSettingsState();

	return (
		<>
			<FormItem title={Strings.get("SETTINGS_CLICK")}>
				<FormText className={Margins.marginBottom8} type="description">
					{Strings.get("SETTINGS_CLICK_NOTE")}
				</FormText>
				<RadioGroup
					options={[
						{
							name: `${Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS")} (${Strings.get("DEFAULT")})`,
							value: 1,
						},
						{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
						{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
						{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
					]}
					onChange={({ value }) => Settings.set("click", value)}
					value={settings.click}
				/>
				<FormDivider className={Margins.marginTop20} />
			</FormItem>
			<FormItem title={Strings.get("SETTINGS_RIGHT_CLICK")} className={Margins.marginTop20}>
				<FormText className={Margins.marginBottom8} type="description">
					{Strings.get("SETTINGS_RIGHT_CLICK_NOTE")}
				</FormText>
				<RadioGroup
					options={[
						{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
						{ name: Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU"), value: 2 },
						{
							name: `${Strings.get("SETTINGS_OPTIONS_STATUS_PICKER")} (${Strings.get("DEFAULT")})`,
							value: 3,
						},
						{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
					]}
					onChange={({ value }) => Settings.set("contextmenu", value)}
					value={settings.contextmenu}
				/>
				<FormDivider className={Margins.marginTop20} />
			</FormItem>
			<FormItem title={Strings.get("SETTINGS_MIDDLE_CLICK")} className={Margins.marginTop20}>
				<FormText className={Margins.marginBottom8} type="description">
					{Strings.get("SETTINGS_MIDDLE_CLICK_NOTE")}
				</FormText>
				<RadioGroup
					options={[
						{ name: Strings.get("SETTINGS_OPTIONS_OPEN_SETTINGS"), value: 1 },
						{
							name: `${Strings.get("SETTINGS_OPTIONS_CONTEXT_MENU")} (${Strings.get("DEFAULT")})`,
							value: 2,
						},
						{ name: Strings.get("SETTINGS_OPTIONS_STATUS_PICKER"), value: 3 },
						{ name: Strings.get("SETTINGS_OPTIONS_NOTHING"), value: 0 },
					]}
					onChange={({ value }) => Settings.set("middleclick", value)}
					value={settings.middleclick}
				/>
				<FormDivider className={Margins.marginTop20} />
			</FormItem>
			<FormSwitch
				className={Margins.marginTop20}
				children={Strings.get("SETTINGS_TOOLTIP")}
				note={Strings.get("SETTINGS_TOOLTIP_NOTE")}
				onChange={(v: boolean) => Settings.set("showTooltip", v)}
				value={settings.showTooltip}
				hideBorder={true}
			/>
		</>
	);
}
