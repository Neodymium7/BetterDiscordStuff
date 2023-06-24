import { Components } from "betterdiscord";
import { Common, partyMembersClasses, Stores, avatarMasked } from "../modules/discordmodules";
import styles from "../styles/partymembers.module.css";

interface PartyMemberProps {
	member: any;
	guildId?: string;
	last?: boolean;
}

function PartyMember(props: PartyMemberProps) {
	const { member, guildId, last } = props;

	const nick = Stores.GuildMemberStore.getNick(guildId, member.id);
	const displayName = nick || member.globalName || member.username;

	const avatarClassName = last ? styles.partyMemberAvatar : `${styles.partyMemberAvatar} ${avatarMasked}`;

	return (
		<div className={styles.partyMember}>
			<Components.Tooltip text={displayName}>
				{(tooltipProps: any) => (
					<Common.Avatar
						{...tooltipProps}
						src={member.getAvatarURL(guildId, 20)}
						aria-label={member.username}
						size={"SIZE_20"}
						className={avatarClassName}
					/>
				)}
			</Components.Tooltip>
		</div>
	);
}

interface PartyMembersProps {
	members: any[];
	guildId?: string;
}

export default function PartyMembers(props: PartyMembersProps) {
	const { members, guildId } = props;

	if (members.length < 1) return null;

	const displayedMembers = members.slice(0, 2);
	const avatars = displayedMembers.map((member, index) => {
		const isLastItem = index === displayedMembers.length - 1;
		return <PartyMember member={member} guildId={guildId} last={isLastItem} />;
	});

	const overflow = Math.min(members.length - avatars.length, 99);

	if (overflow === 1) {
		const prevMember = members[1];
		const member = members[2];
		avatars.pop();
		avatars.push(
			<PartyMember member={prevMember} guildId={guildId} />,
			<PartyMember member={member} guildId={guildId} last />
		);
	}

	return (
		<div className={`${partyMembersClasses.wrapper} ${styles.partyMembers}`}>
			<div className={partyMembersClasses.partyMembers}>
				{avatars}
				{overflow > 1 && (
					<div className={`${partyMembersClasses.partyMemberOverflow} ${styles.overflow}`}>
						{"+" + overflow}
					</div>
				)}
			</div>
		</div>
	);
}
