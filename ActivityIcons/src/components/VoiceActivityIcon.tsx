import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { Settings } from "../modules/utils";

interface VoiceActivityIconProps {
	activities: any[];
}

export default function VoiceActivityIcon(props: VoiceActivityIconProps) {
	const { voiceActivityIcons } = Settings.useSettingsState();
	if (!voiceActivityIcons) return null;

	const activity = props.activities.filter((activity) => activity.type === 3)[0];
	if (!activity) return null;

	return (
		<Components.Tooltip text={<strong>{activity.name}</strong>} position="top">
			{(props) => (
				<div {...props} className="activity-icon">
					<Icons.Rocket className="activity-icon-small" width="14" height="14" />
				</div>
			)}
		</Components.Tooltip>
	);
}
