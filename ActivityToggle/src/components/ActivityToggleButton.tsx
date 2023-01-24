import { Webpack, ContextMenu } from "betterdiscord";
import { DiscordClasses, DiscordModules } from "zlibrary";
import ActivityDisabledIcon from "./ActivityDisabledIcon";

const {
	Filters: { byProps, byStrings },
	getModule,
} = Webpack;

const { UserSettingsWindow } = DiscordModules;

const Sections = getModule(byProps("ACCOUNT"), { searchExports: true });
const PanelButton = getModule(byStrings("PANEL_BUTTON"));
const Activity = getModule(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"));
const Settings = getModule(byStrings("M14 7V9C14 9 12.5867 9"));
const playSound = getModule(byStrings(".getSoundpack()"), { searchExports: true });
const { useSetting, updateSetting } = getModule((m) => Object.values(m).some((e: any) => e?.getSetting)).G6;

export default function ActivityToggleButton() {
	const enabled = useSetting();

	return (
		<PanelButton
			icon={enabled ? Activity : ActivityDisabledIcon}
			iconForeground={enabled ? null : DiscordClasses.AccountDetails.strikethrough}
			tooltipText={enabled ? "Disable Activity" : "Enable Activity"}
			onClick={() => {
				updateSetting(!enabled);
				playSound(enabled ? "stream_user_left" : "stream_user_joined", 0.4);
			}}
			onContextMenu={(e: React.MouseEvent) => {
				ContextMenu.open(
					e,
					ContextMenu.buildMenu([
						{
							label: "Activity Settings",
							icon: Settings,
							action: () => {
								UserSettingsWindow.setSection(Sections.ACTIVITY_PRIVACY);
								UserSettingsWindow.open();
							},
						},
					])
				);
			}}
		/>
	);
}
