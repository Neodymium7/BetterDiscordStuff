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
	const enabled = useSetting();

	return (
		<PanelButton
			icon={enabled ? Activity : ActivityDisabledIcon}
			iconForeground={enabled ? null : DiscordClasses.AccountDetails.strikethrough}
			tooltipText={enabled ? "Disable Activity" : "Enable Activity"}
			onClick={() => {
				if (!updateSetting) {
					return UI.alert("Error", "Could not update setting. See the console for more information.");
				}
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
