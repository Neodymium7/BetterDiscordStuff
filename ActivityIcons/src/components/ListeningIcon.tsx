import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { isBot, Settings, Strings } from "../modules/utils";
import { parseString } from "@lib/utils/string";

interface ListeningIconProps {
	activities: any[];
}

export default function ListeningIcon(props: ListeningIconProps) {
	const { listeningIcons } = Settings.useSettingsState("listeningIcons");
	if (!listeningIcons) return null;

	if (isBot(props.activities)) return null;

	const activity = props.activities.filter((activity) => activity.type === 2)[0];
	if (!activity) return null;

	return (
		<Components.Tooltip
			text={
				<>
					<div style={{ fontWeight: "600" }}>{activity.details}</div>
					{activity.state && (
						<div style={{ fontWeight: "400" }}>
							{parseString(Strings.get("LISTENING_TOOLTIP_ARTIST"), {
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
					<Icons.Headset color="currentColor" size="13" width="13" height="13" />
				</div>
			)}
		</Components.Tooltip>
	);
}
