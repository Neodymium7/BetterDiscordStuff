import { getAcronym } from "../modules/discordmodules";
import styles from "../styles/guildimage.module.scss";
import defaultGroupIcon from "../assets/default_group_icon.png";
import { GuildActions, transitionTo } from "@discord/modules";

interface GuildImageProps {
	guild: any;
	channel: any;
	channelPath: string;
}

const getIconFontSize = (name: string) => {
	const words = name.split(" ");
	if (words.length > 7) return 10;
	else if (words.length === 6) return 12;
	else if (words.length === 5) return 14;
	else return 16;
};

const getImageLink = (guild: any, channel: any) => {
	let image = "";
	if (guild && guild.icon) {
		image = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`;
	} else if (channel.icon) {
		image = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
	} else if (channel.type === 3) {
		image = defaultGroupIcon;
	}
	return image;
};

export default function GuildImage(props: GuildImageProps) {
	const image = getImageLink(props.guild, props.channel);

	const onClick = () => {
		if (props.guild) GuildActions?.transitionToGuildSync(props.guild.id);
		else if (props.channelPath) transitionTo?.(props.channelPath);
	};

	if (image) {
		return (
			<img
				className={styles.icon}
				src={image}
				width="48"
				height="48"
				style={{ borderRadius: "16px", cursor: "pointer" }}
				onClick={onClick}
			/>
		);
	} else {
		return (
			<div
				className={styles.defaultIcon}
				onClick={onClick}
				style={{ fontSize: `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }}
			>
				{getAcronym(props.guild ? props.guild.name : props.guild.id)}
			</div>
		);
	}
}
