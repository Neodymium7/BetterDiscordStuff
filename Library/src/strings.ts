import { Webpack } from "betterdiscord";

type Override<T, U> = Omit<T, keyof U> & U;

// prettier-ignore
/**
 * A locale available in Discord.
 */
type LocaleCode = "da" | "de" | "en-US" | "es-ES" | "fr" | "hr" | "it" | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "pt-PT" | "ro" | "fi" | "sv-SE" | "vi" | "tr" | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko";

/**
 * An object with keys for each available locale, and values of objects containing the strings for that locale.
 */
type LocalesObject = {
	[code in LocaleCode]?: Record<string, string>;
};

interface StringsManager {
	/**
	 * Subscribes to Discord's locale changes. Should be run on plugin start.
	 */
	subscribe(): void;

	/**
	 * Unsubscribes from Discord's locale changes. Should be run on plugin stop.
	 */
	unsubscribe(): void;
}

type Strings<T extends LocalesObject, D extends keyof T> = Override<StringsManager, Readonly<T[D]>>;

const Dispatcher = /* @__PURE__ */ Webpack.getModule(/* @__PURE__ */ Webpack.Filters.byProps("dispatch", "subscribe"));
const LocaleManager = /* @__PURE__ */ Webpack.getModule((m) => m.Messages?.CLOSE);

/**
 * Creates a `Strings` object with the given locales object.
 * @param locales An object containing the strings for each locale.
 * @param defaultLocale The code of the locale to use as a fallback when strings for Discord's selected locale are not defined.
 * @returns A `Strings` object.
 */
export function createStrings<T extends LocalesObject, D extends keyof T>(locales: T, defaultLocale: D) {
	let strings: T[D] = locales[defaultLocale];

	const setLocale = () => {
		strings = locales[LocaleManager.getLocale()] || locales[defaultLocale];
	};

	const stringsManager: StringsManager = {
		subscribe() {
			setLocale();
			Dispatcher.subscribe("I18N_LOAD_SUCCESS", setLocale);
		},
		unsubscribe() {
			Dispatcher.unsubscribe("I18N_LOAD_SUCCESS", setLocale);
		},
	};

	for (const key in strings) {
		Object.defineProperty(stringsManager, key, {
			get() {
				return strings[key] || this.locales[this.defaultLocale][key];
			},
			enumerable: true,
			configurable: false,
		});
	}

	return stringsManager as unknown as Strings<T, D>;
}
