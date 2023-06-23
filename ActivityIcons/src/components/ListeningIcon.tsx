import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { Settings, Strings } from "../modules/utils";
import { parseString } from "@lib/utils/string";

interface ListeningIconProps {
	activities: any[];
}

export default function ListeningIcon(props: ListeningIconProps) {
	const { listeningIcons } = Settings.useSettingsState();
	if (!listeningIcons) return null;

	const activity = props.activities.filter((activity) => activity.type === 2)[0];
	if (!activity) return null;

	return (
		<Components.Tooltip
			text={
				<>
					<div style={{ fontWeight: "600" }}>{activity.details}</div>
					{activity.state && (
						<div style={{ fontWeight: "400" }}>
							{parseString(Strings.LISTENING_TOOLTIP_ARTIST, {
								NAME: activity.state.replace(/;/g, ","),
							})}
						</div>
					)}
				</>
			}
			position="top"
		>
			{(props) => (
				<div {...props} className="activity-icon">
					<Icons.Headset className="activity-icon-small" width="14" height="14" />
				</div>
			)}
		</Components.Tooltip>
	);
}
