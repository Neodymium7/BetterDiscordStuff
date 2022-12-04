import { Webpack } from "betterdiscord";

const {
	Filters: { byStrings },
	getModule,
} = Webpack;

export const CallJoin = getModule(byStrings("M11 5V3C16.515 3 21 7.486"));
export const People = getModule(byStrings("M14 8.00598C14 10.211 12.206 12.006"));
export const Speaker = getModule(byStrings("M11.383 3.07904C11.009 2.92504 10.579 3.01004"));
export const Muted = getModule(byStrings("M6.7 11H5C5 12.19 5.34 13.3"));
export const Deafened = getModule(byStrings("M6.16204 15.0065C6.10859 15.0022 6.05455 15"));
export const Video = getModule(byStrings("M21.526 8.149C21.231 7.966 20.862 7.951"));
export const Stage = getModule(
	byStrings(
		"M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5"
	)
);
