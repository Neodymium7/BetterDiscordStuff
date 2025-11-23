import { ContextMenu, UI } from "betterdiscord";
import { PanelButton, playSound, ShowCurrentGame } from "../modules";
import ActivityDisabledIcon from "./ActivityDisabledIcon";
import { Activity, Settings } from "@discord/icons";
import { SettingsSections, UserSettings } from "@discord/modules";

export default function ActivityToggleButton() {
	const activityEnabled = ShowCurrentGame.useSetting();

	return (
		<PanelButton
			icon={activityEnabled ? Activity : ActivityDisabledIcon}
			tooltipText={activityEnabled ? "Disable Activity" : "Enable Activity"}
			onClick={() => {
				if (!ShowCurrentGame.updateSetting) {
					return UI.alert("Error", "Could not update setting. See the console for more information.");
				}
				ShowCurrentGame.updateSetting(!activityEnabled);
				playSound?.(activityEnabled ? "activity_user_left" : "activity_user_join", 0.4);
			}}
			onContextMenu={(e: React.MouseEvent) => {
				ContextMenu.open(
					e,
					ContextMenu.buildMenu([
						{
							label: "Activity Settings",
							icon: Settings,
							action: () => {
								if (!UserSettings) {
									return UI.alert(
										"Error",
										"Could not open settings window. See the console for more information."
									);
								}
								UserSettings.openUserSettings(SettingsSections.ACTIVITY_PRIVACY_PANEL);
							},
						},
					])
				);
			}}
			redGlow={!activityEnabled}
		/>
	);
}
