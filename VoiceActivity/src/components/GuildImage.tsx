import { Webpack } from "betterdiscord";
import { DiscordModules } from "zlibrary";
import { getIconFontSize, getImageLink, transitionTo } from "../utils";
import styles from "../styles/guildimage.module.scss";

const {
	Filters: { byStrings },
	getModule,
} = Webpack;

const { GuildActions } = DiscordModules;
const getAcronym = getModule(byStrings('.replace(/\'s /g," ").replace(/\\w+/g,'), { searchExports: true });

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
					else if (props.channelPath) transitionTo(props.channelPath);
				}}
			/>
		);
	} else {
		return (
			<div
				className={styles.defaultIcon}
				onClick={() => {
					if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
					else if (props.channelPath) transitionTo(props.channelPath);
				}}
				style={{ fontSize: `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }}
			>
				{getAcronym(props.guild ? props.guild.name : props.guild.id)}
			</div>
		);
	}
}
