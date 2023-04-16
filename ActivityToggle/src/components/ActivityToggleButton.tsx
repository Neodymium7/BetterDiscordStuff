import { ContextMenu, UI } from "betterdiscord";
import { DiscordClasses } from "zlibrary";
import {
	Activity,
	PanelButton,
	playSound,
	Sections,
	Settings,
	updateSetting,
	UserSettingsWindow,
	useSetting,
} from "../modules";
import ActivityDisabledIcon from "./ActivityDisabledIcon";

export default function ActivityToggleButton() {
	const activityEnabled = useSetting();

	return (
		<PanelButton
			icon={activityEnabled ? Activity : ActivityDisabledIcon}
			iconForeground={activityEnabled ? null : DiscordClasses.AccountDetails.strikethrough}
			tooltipText={activityEnabled ? "Disable Activity" : "Enable Activity"}
			onClick={() => {
				if (!updateSetting) {
					return UI.alert("Error", "Could not update setting. See the console for more information.");
				}
				updateSetting(!activityEnabled);
				playSound(activityEnabled ? "stream_user_left" : "stream_user_joined", 0.4);
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
