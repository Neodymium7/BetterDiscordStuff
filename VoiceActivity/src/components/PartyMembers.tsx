import { Common, UserPopout, loadProfile, partyMemberClasses, partyMembersClasses } from "../modules/discordmodules";
import styles from "../styles/partymembers.module.css";

interface PartyMemberProps {
	member: any;
	guildId?: string;
	popoutDisabled?: boolean;
}

function PartyMember(props: PartyMemberProps) {
	const { member, guildId, popoutDisabled } = props;

	return popoutDisabled ? (
		<div className={partyMemberClasses.partyMemberKnown} style={{ pointerEvents: "none" }}>
			<Common.Avatar
				{...props}
				src={member.getAvatarURL(guildId, 20)}
				aria-label={member.username}
				size={"SIZE_20"}
				className={partyMemberClasses.partyMember}
			/>
		</div>
	) : (
		<div className={partyMemberClasses.partyMemberKnown}>
			<Common.Popout
				preload={() =>
					loadProfile(member.id, member.getAvatarURL(guildId, 80), {
						guildId,
					})
				}
				renderPopout={(props) => <UserPopout {...props} userId={member.id} guildId={guildId} />}
				position="left"
			>
				{(props) => (
					<Common.Avatar
						{...props}
						src={member.getAvatarURL(guildId, 20)}
						aria-label={member.username}
						size={"SIZE_20"}
						className={partyMemberClasses.partyMember}
					/>
				)}
			</Common.Popout>
		</div>
	);
}

interface PartyMembersProps {
	members: any[];
	guildId?: string;
	activeUserId?: string;
}

export default function PartyMembers(props: PartyMembersProps) {
	const { members, guildId, activeUserId } = props;

	if (members.length < 1) return null;

	const avatars = members
		.slice(0, 2)
		.map((member) =>
			member.id === activeUserId ? (
				<PartyMember member={member} guildId={guildId} popoutDisabled />
			) : (
				<PartyMember member={member} guildId={guildId} />
			)
		);

	const overflow = Math.min(members.length - avatars.length, 99);

	if (overflow === 1) {
		const member = members[2];
		avatars.push(
			member.id === activeUserId ? (
				<PartyMember member={member} guildId={guildId} popoutDisabled />
			) : (
				<PartyMember member={member} guildId={guildId} />
			)
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
