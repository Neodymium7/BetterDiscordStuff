import { Components } from "betterdiscord";
import { RelationshipStore, TypingDots, TypingStore, UserStore, useStateFromStores } from "./modules/discordmodules";
import { getDisplayName, Strings } from "./modules/utils";
import { parseStringReact } from "@lib/utils/string";

export function TypingIndicator({ channelId, guildId }) {
	const typingUsersState = useStateFromStores([TypingStore], () => TypingStore.getTypingUsers(channelId));

	const typingUsersIds = Object.keys(typingUsersState).filter(
		(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
	);

	if (!typingUsersIds.length) return null;

	let tooltip;

	if (typingUsersIds.length > 3) {
		tooltip = Strings.get("TYPING_LENGTH_MANY");
	} else {
		const typingUsersElements = typingUsersIds.map((id) => (
			<strong style={{ fontWeight: 700 }}>{getDisplayName(id, guildId)}</strong>
		));

		if (typingUsersElements.length == 1) {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_1"), { USER: typingUsersElements[0] });
		} else if (typingUsersElements.length == 2) {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_2"), {
				USER1: typingUsersElements[0],
				USER2: typingUsersElements[1],
			});
		} else {
			tooltip = parseStringReact(Strings.get("TYPING_LENGTH_3"), {
				USER1: typingUsersElements[0],
				USER2: typingUsersElements[1],
				USER3: typingUsersElements[2],
			});
		}
	}

	return (
		<Components.Tooltip text={tooltip} position="top">
			{(props) => (
				<div {...props} className="channelTypingIndicator">
					<TypingDots dotRadius={3.5} themed />
				</div>
			)}
		</Components.Tooltip>
	);
}
