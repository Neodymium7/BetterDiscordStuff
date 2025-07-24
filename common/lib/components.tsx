import { Popout, UserPopout } from "@discord/components";
import { loadProfile } from "@discord/modules";
import { UserStore } from "@discord/stores";
import { Components } from "betterdiscord";
import { useRef } from "react";
import { ErrorPopout } from "./utils/react";

interface UserPopoutWrapperProps {
	id: string;
	guildId: string;
	channelId: string;
	children: React.ReactElement;
}

export function UserPopoutWrapper({ id, guildId, channelId, children }: UserPopoutWrapperProps) {
	const ref = useRef(null);

	const user = UserStore.getUser(id);
	const currentUser = UserStore.getCurrentUser();

	return (
		<Popout
			align="left"
			position="top"
			clickTrap
			renderPopout={(props: any) => (
				<Components.ErrorBoundary>
					<UserPopout
						{...props}
						currentUser={currentUser}
						user={user}
						guildId={guildId}
						channelId={channelId}
					/>
				</Components.ErrorBoundary>
			)}
			preload={() =>
				loadProfile?.(user.id, user.getAvatarURL(guildId, 80), {
					type: "popout",
					withMutualGuilds: user.id !== currentUser.id,
					withMutualFriends: !user.bot && user.id !== currentUser.id,
					guildId,
					channelId,
				})
			}
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
