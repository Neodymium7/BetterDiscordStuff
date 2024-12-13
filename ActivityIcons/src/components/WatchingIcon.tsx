import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { isBot, Settings } from "../modules/utils";

interface WatchingIconProps {
	activities: any[];
}

export default function WatchingIcon(props: WatchingIconProps) {
	const { watchingIcons } = Settings.useSettingsState("watchingIcons");
	if (!watchingIcons) return null;

	if (isBot(props.activities)) return null;

	const activity = props.activities.filter((activity) => activity.type === 3)[0];
	if (!activity) return null;

	return (
		<Components.Tooltip text={<strong>{activity.name}</strong>}>
			{(props) => (
				<div {...props} className="activity-icon">
					<Icons.Screen color="currentColor" size="13" width="13" height="13" />
				</div>
			)}
		</Components.Tooltip>
	);
}
