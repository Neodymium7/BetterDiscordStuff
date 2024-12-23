import { StringsManager } from "@lib";
import locales from "../locales.json";
import { GuildMemberStore, UserStore } from "@discord/stores";

export const Strings = new StringsManager(locales, "en-US");

export const getDisplayName = (userId: string, guildId: string): string => {
	const { nick } = GuildMemberStore.getMember(guildId, userId);
	if (nick) return nick;
	const user = UserStore.getUser(userId);
	return user.globalName || user.username;
};
