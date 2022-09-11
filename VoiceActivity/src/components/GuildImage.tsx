import { Webpack } from "betterdiscord";
import { DiscordModules } from "zlibrary";
import { getIconFontSize, getImageLink } from "../utils";
import styles from "../styles/guildimage.scss?module";

const {
	Filters: { byProps },
	getModule
} = Webpack;

const { NavigationUtils, GuildActions } = DiscordModules;
const { getAcronym } = getModule(byProps("getAcronym"));

interface GuildImageProps {
	guild: any;
	channel: any;
	channelPath: string;
}

export default function GuildImage(props: GuildImageProps) {
	const image = getImageLink(props.guild, props.channel);

	if (image) {
		return (
			<img
				className={styles.icon}
				src={image}
				width="48"
				height="48"
				style={{ borderRadius: "16px", cursor: "pointer" }}
				onClick={() => {
					if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
					else if (props.channelPath) NavigationUtils.transitionTo(props.channelPath);
				}}
			/>
		);
	} else {
		return (
			<div
				className={styles.defaultIcon}
				onClick={() => {
					if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
					else if (props.channelPath) NavigationUtils.transitionTo(props.channelPath);
				}}
				style={{ fontSize: `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }}
			>
				{getAcronym(props.guild ? props.guild.name : props.guild.id)}
			</div>
		);
	}
}
