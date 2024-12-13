import { Webpack } from "betterdiscord";

// prettier-ignore
/**
 * A locale available in Discord.
 */
type LocaleCode = "da" | "de" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it" | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "pt-PT" | "ro" | "fi" | "sv-SE" | "vi" | "tr" | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko";

/**
 * An object with keys for each available locale, and values of objects containing the strings for that locale.
 */
type LocalesObject = {
	[code in LocaleCode]?: Record<string, string>;
};

const LocaleStore = /* @__PURE__ */ Webpack.getStore("LocaleStore");

export class StringsManager<T extends LocalesObject, D extends keyof T> {
	private locales: T;
	private defaultLocale: D;
	private strings: T[D];

	/**
	 * Creates a `StringsManager` object with the given locales object.
	 * @param locales An object containing the strings for each locale.
	 * @param defaultLocale The code of the locale to use as a fallback when strings for Discord's selected locale are not defined.
	 * @returns A `StringsManager` object.
	 */
	constructor(locales: T, defaultLocale: D) {
		this.locales = locales;
		this.defaultLocale = defaultLocale;
		this.strings = locales[defaultLocale];
	}

	private setLocale = () => {
		this.strings = this.locales[LocaleStore.locale] || this.locales[this.defaultLocale];
	};

	/**
	 * Subscribes to Discord's locale changes. Should be run on plugin start.
	 */
	subscribe() {
		this.setLocale();
		LocaleStore.addReactChangeListener(this.setLocale);
	}

	/**
	 * Unsubscribes from Discord's locale changes. Should be run on plugin stop.
	 */
	unsubscribe() {
		LocaleStore.removeReactChangeListener(this.setLocale);
	}

	/**
	 * Gets the string for the corresponding key in Discord's currently selected locale.
	 * @param key The string key.
	 * @returns A localized string.
	 */
	get(key: keyof T[D]) {
		return this.strings[key] || this.locales[this.defaultLocale][key];
	}
}
