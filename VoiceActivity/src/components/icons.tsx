import { Webpack } from "betterdiscord";

const {
	Filters: { byDisplayName },
	getModule
} = Webpack;

export const CallJoin = getModule(byDisplayName("CallJoin"));
export const People = getModule(byDisplayName("People"));
export const Speaker = getModule(byDisplayName("Speaker"));
export const Stage = getModule(byDisplayName("Stage"));
