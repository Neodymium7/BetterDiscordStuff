import { Components } from "betterdiscord";
import { Icons } from "../modules/discordmodules";
import { Settings, Strings, parseStringReact } from "../modules/utils";
import { Component as Playstation } from "../assets/playstation.svg";
import { Component as Xbox } from "../assets/xbox.svg";

const botActivityKeys = ["created_at", "id", "name", "type", "url"];

interface ActivityIconProps {
	activities: any[];
}

export default function ActivityIcon(props: ActivityIconProps) {
	const { normalActivityIcons } = Settings.useSettingsState();

	if (!normalActivityIcons) return null;

	const isBot =
		props.activities.length === 1 &&
		props.activities[0].type === 0 &&
		Object.keys(props.activities[0]).every((value, i) => value === botActivityKeys[i]);

	if (isBot || props.activities.length === 0) return null;

	const normalActivities = props.activities.filter((activity) => activity.type === 0);

	// const isStreaming = props.activities.some((activity) => activity.type === 1);
	const hasCustomStatus = props.activities.some((activity) => activity.type === 4 && activity.state);
	const hasRP = normalActivities.some((activity) => (activity.assets || activity.details) && !activity.platform);
	const onPS = normalActivities.some((activity) => activity.platform === "ps5" || activity.platform === "ps4");
	const onXbox = normalActivities.some((activity) => activity.platform === "xbox");

	if (normalActivities.length === 0) return null;

	let tooltip: React.ReactNode;
	if (normalActivities.length === 1 && hasCustomStatus) {
		tooltip = <strong>{normalActivities[0].name}</strong>;
	} else if (normalActivities.length === 2) {
		tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_2, {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
		});
	} else if (normalActivities.length === 3) {
		tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_3, {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
			ACTIVITY3: <strong>{normalActivities[2].name}</strong>,
		});
	} else if (normalActivities.length > 3) {
		tooltip = parseStringReact(Strings.ACTIVITY_TOOLTIP_LENGTH_MANY, {
			ACTIVITY1: <strong>{normalActivities[0].name}</strong>,
			ACTIVITY2: <strong>{normalActivities[1].name}</strong>,
			COUNT: normalActivities.length - 2,
		});
	}

	let icon = <Icons.Activity width="16" height="16" />;
	if (onPS) icon = <Playstation width="14" height="14" className="activity-icon-small" />;
	if (onXbox) icon = <Xbox width="14" height="14" className="activity-icon-small" />;
	if (hasRP) icon = <Icons.RichActivity width="16" height="16" />;

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
