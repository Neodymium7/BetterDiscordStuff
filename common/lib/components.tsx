import { Popout, UserPopout } from "@discord/components";
import { loadProfile } from "@discord/modules";
import { UserStore } from "@discord/stores";
import { useRef } from "react";

interface UserPopoutWrapperProps {
	id: string;
	guildId: string;
	channelId: string;
	children: React.ReactElement;
}

export function UserPopoutWrapper({ id, guildId, channelId, children }: UserPopoutWrapperProps) {
	const ref = useRef(null);

	const user = UserStore.getUser(id);

	return (
		<Popout
			align="left"
			position="top"
			clickTrap
			renderPopout={(props: any) => (
				<UserPopout
					{...props}
					currentUser={UserStore.getCurrentUser()}
					user={user}
					guildId={guildId}
					channelId={channelId}
				/>
			)}
			preload={() => loadProfile?.(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })}
			targetElementRef={ref}
		>
			{(props: any) => (
				<span ref={ref} {...props}>
					{children}
				</span>
			)}
		</Popout>
	);
}
