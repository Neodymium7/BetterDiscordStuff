import { Components } from "betterdiscord";
import { Settings, Strings, isBot } from "../modules/utils";
import { Component as Playstation } from "../assets/playstation.svg";
import { Component as Xbox } from "../assets/xbox.svg";
import { parseStringReact } from "@lib/utils/string";
import { Activity, RichActivity } from "@discord/icons";

interface ActivityIconProps {
	activities: any[];
}

export default function ActivityIcon(props: ActivityIconProps) {
	const { normalActivityIcons, richPresenceIcons, platformIcons } = Settings.useSettingsState(
		"normalActivityIcons",
		"richPresenceIcons",
		"platformIcons"
	);

	if (!normalActivityIcons && !richPresenceIcons && !platformIcons) return null;

	if (isBot(props.activities) || props.activities.length === 0) return null;

	const normalActivities = props.activities.filter((activity) => activity.type === 0);

	// const isStreaming = props.activities.some((activity) => activity.type === 1);
	const hasCustomStatus = props.activities.some((activity) => activity.type === 4 && activity.state);
	const hasRP = normalActivities.some((activity) => (activity.assets || activity.details) && !activity.platform);
	const onPS = normalActivities.some((activity) => activity.platform === "ps5" || activity.platform === "ps4");
	const onXbox = normalActivities.some((activity) => activity.platform === "xbox");

	if (normalActivities.length === 0) return null;
	if (!normalActivityIcons && !hasRP && !onPS && !onXbox) return null;
	if (!normalActivityIcons && !platformIcons && richPresenceIcons && !hasRP) return null;
	if (!normalActivityIcons && !richPresenceIcons && platformIcons && !onPS && !onXbox) return null;

	let tooltip: React.ReactNode;
	if (normalActivities.length === 1 && hasCustomStatus) {
		tooltip = <strong>{normalActivities[0].name}</strong>;
	} else if (normalActivities.length === 2) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_2"), {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
		});
	} else if (normalActivities.length === 3) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_3"), {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
			ACTIVITY3: <strong>{normalActivities[2].name}</strong>,
		});
	} else if (normalActivities.length > 3) {
		tooltip = parseStringReact(Strings.get("ACTIVITY_TOOLTIP_LENGTH_MANY"), {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
			COUNT: normalActivities.length - 2,
		});
	}

	let icon = <Activity color="currentColor" size="13" width="13" height="13" />;
	if (platformIcons && onPS) icon = <Playstation color="currentColor" size="13" width="13" height="13" />;
	if (platformIcons && onXbox) icon = <Xbox color="currentColor" size="13" width="13" height="13" />;
	if (richPresenceIcons && hasRP) icon = <RichActivity color="currentColor" size="16" width="16" height="16" />;

	return tooltip ? (
		<Components.Tooltip text={tooltip} position="top">
			{(props: any) => (
				<div {...props} className={hasRP ? "activity-icon rich-activity-icon" : "activity-icon"}>
					{icon}
				</div>
			)}
		</Components.Tooltip>
	) : (
		<div className={hasRP ? "activity-icon rich-activity-icon" : "activity-icon"}>{icon}</div>
	);
}
