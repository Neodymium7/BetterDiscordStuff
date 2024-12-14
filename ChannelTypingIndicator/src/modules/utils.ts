import { StringsManager } from "@lib";
import locales from "../locales.json";
import { GuildMemberStore, UserStore } from "./discordmodules";

export const Strings = new StringsManager(locales, "en-US");

export const getDisplayName = (userId: string, guildId: string): string => {
	const { nick } = GuildMemberStore.getMember(guildId, userId);
	if (nick) return nick;
	return UserStore.getUser(userId).globalName;
};
