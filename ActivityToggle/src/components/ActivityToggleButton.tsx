import { ContextMenu, UI } from "betterdiscord";
import {
	AccountClasses,
	Activity,
	PanelButton,
	Sections,
	Settings,
	UserSettingsWindow,
	Sounds,
	ShowCurrentGame,
} from "../modules";
import ActivityDisabledIcon from "./ActivityDisabledIcon";

export default function ActivityToggleButton() {
	const activityEnabled = ShowCurrentGame.useSetting();

	return (
		<PanelButton
			icon={activityEnabled ? Activity : ActivityDisabledIcon}
			iconForeground={activityEnabled ? null : AccountClasses.strikethrough}
			tooltipText={activityEnabled ? "Disable Activity" : "Enable Activity"}
			onClick={() => {
				if (!ShowCurrentGame.updateSetting) {
					return UI.alert("Error", "Could not update setting. See the console for more information.");
				}
				ShowCurrentGame.updateSetting(!activityEnabled);
				Sounds.playSound(activityEnabled ? "activity_user_left" : "activity_user_join", 0.4);
			}}
			onContextMenu={(e: React.MouseEvent) => {
				ContextMenu.open(
					e,
					ContextMenu.buildMenu([
						{
							label: "Activity Settings",
							icon: Settings,
							action: () => {
								if (!UserSettingsWindow) {
									return UI.alert(
										"Error",
										"Could not open settings window. See the console for more information."
									);
								}
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
