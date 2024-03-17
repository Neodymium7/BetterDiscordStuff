import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { Settings } from "../modules/utils";

interface WatchingIconProps {
	activities: any[];
}

export default function WatchingIcon(props: WatchingIconProps) {
	const { watchingIcons } = Settings.useSettingsState();
	if (!watchingIcons) return null;

	const activity = props.activities.filter((activity) => activity.type === 3)[0];
	if (!activity) return null;

	return (
		<Components.Tooltip text={<strong>{activity.name}</strong>}>
			{(props) => (
				<div {...props} className="activity-icon">
					<Icons.Screen width="13" height="13" />
				</div>
			)}
		</Components.Tooltip>
	);
}
