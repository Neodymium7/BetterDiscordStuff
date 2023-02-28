import { Webpack } from "betterdiscord";
import { Settings } from "../utils";
import { Component as Playstation } from "../assets/playstation.svg";
import { Component as Xbox } from "../assets/xbox.svg";

const {
	Filters: { byPrototypeFields, byStrings },
	getModule,
} = Webpack;

const Activity = getModule(byStrings("M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264"));
const RichActivity = getModule(byStrings("M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4"));
const Tooltip = getModule(byPrototypeFields("renderTooltip"), { searchExports: true });

const bot = ["created_at", "id", "name", "type", "url"];

interface ActivityIconProps {
	activities: any[];
}

export default function ActivityIcon(props: ActivityIconProps) {
	const { activities } = props;

	const { normalIconBehavior } = Settings.useSettingsState();

	const isBot =
		activities.length === 1 &&
		activities[0].type === 0 &&
		Object.keys(activities[0]).every((value, i) => value === bot[i]);

	if (isBot || activities.length === 0) return null;

	const normalActivities = props.activities.filter((activity) => activity.type === 0);

	// const isStreaming = props.activities.some((activity) => activity.type === 1);
	const hasCustomStatus = props.activities.some((activity) => activity.type === 4 && activity.state);
	const hasRP = normalActivities.some((activity) => (activity.assets || activity.details) && !activity.platform);
	const onPS = normalActivities.some((activity) => activity.platform === "ps5" || activity.platform === "ps4");
	const onXbox = normalActivities.some((activity) => activity.platform === "xbox");

	if (normalActivities.length === 0) return null;
	if (normalIconBehavior === 2 && !(hasRP || onPS || onXbox)) return null;
	if (normalIconBehavior === 1 && !hasCustomStatus && !(hasRP || onPS || onXbox)) return null;

	let tooltip: React.ReactElement;
	if (normalActivities.length === 1 && hasCustomStatus) {
		tooltip = <strong>{normalActivities[0].name}</strong>;
	} else if (normalActivities.length === 2) {
		tooltip = (
			<>
				<strong>{normalActivities[0].name}</strong> and <strong>{normalActivities[1].name}</strong>
			</>
		);
	} else if (normalActivities.length === 3) {
		tooltip = (
			<>
				<strong>{normalActivities[0].name}</strong>, <strong>{normalActivities[1].name}</strong> and{" "}
				<strong>{normalActivities[2].name}</strong>
			</>
		);
	} else if (normalActivities.length > 3) {
		tooltip = (
			<>
				<strong>{normalActivities[0].name}</strong>, <strong>{normalActivities[1].name}</strong> and{" "}
				{normalActivities.length - 2} more
			</>
		);
	}

	let icon = <Activity width="16" height="16" />;
	if (onPS) icon = <Playstation width="14" height="14" className="activity-icon-small" />;
	if (onXbox) icon = <Xbox width="14" height="14" className="activity-icon-small" />;
	if (hasRP) icon = <RichActivity width="16" height="16" />;

	return tooltip ? (
		<Tooltip text={tooltip} position="top">
			{(props: any) => (
				<div {...props} className={hasRP ? "activity-icon rich-activity-icon" : "activity-icon"}>
					{icon}
				</div>
			)}
		</Tooltip>
	) : (
		<div className={hasRP ? "activity-icon rich-activity-icon" : "activity-icon"}>{icon}</div>
	);
}
