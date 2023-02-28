import { Webpack } from "betterdiscord";

const {
	Filters: { byPrototypeFields, byStrings },
	getModule,
} = Webpack;

const Headset = getModule(byStrings("M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2"));
const Tooltip = getModule(byPrototypeFields("renderTooltip"), { searchExports: true });

interface ListeningIconProps {
	activities: any[];
}

export default function ListeningIcon(props: ListeningIconProps) {
	const activity = props.activities.filter((activity) => activity.type === 2)[0];
	if (!activity) return null;

	return (
		<Tooltip
			text={
				<>
					<div style={{ fontWeight: "600" }}>{activity.details}</div>
					{activity.state && (
						<div style={{ fontWeight: "400" }}>{`by ${activity.state.replace(/;/g, ",")}`}</div>
					)}
				</>
			}
			position="top"
		>
			{(props) => (
				<div {...props} className="activity-icon">
					<Headset className="activity-icon-small" width="14" height="14"></Headset>
				</div>
			)}
		</Tooltip>
	);
}
