import { WebpackModules } from "@zlibrary";

const PartyAvatars = WebpackModules.getByDisplayName("PartyAvatars");

export default function WrappedPartyAvatars(props) {
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
