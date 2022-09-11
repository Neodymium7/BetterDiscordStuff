import { Webpack } from "betterdiscord";

const {
	Filters: { byDisplayName },
	getModule
} = Webpack;

const PartyAvatars = getModule(byDisplayName("PartyAvatars"));

interface WrappedPartyAvatarsProps {
	guild: any;
	channel: any;
	members: any;
}

export default function WrappedPartyAvatars(props: WrappedPartyAvatarsProps) {
	if (props.guild) {
		return (
			<PartyAvatars
				guildId={props.guild.id}
				members={props.members}
				partySize={{
					knownSize: props.members.length,
					totalSize: props.members.length,
					unknownSize: 0
				}}
			/>
		);
	} else if (props.channel.type === 3) {
		return (
			<PartyAvatars
				members={props.members}
				partySize={{
					knownSize: props.members.length,
					totalSize: props.members.length,
					unknownSize: 0
				}}
			/>
		);
	} else return null;
}
