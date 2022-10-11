import { Webpack } from "betterdiscord";

const {
	Filters: { byStrings },
	getModule
} = Webpack;

export const CallJoin = getModule(byStrings("M11 5V3C16.515 3 21 7.486"));
export const People = getModule(byStrings("M14 8.00598C14 10.211 12.206 12.006"));
export const Speaker = getModule(byStrings("M11.383 3.07904C11.009 2.92504 10.579 3.01004"));
export const Stage = getModule(
	byStrings(
		"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
	)
);
