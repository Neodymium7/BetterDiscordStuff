// Contribute translations by adding to locales.json. Make sure the locale name corresponds to one of Discord's available locales, and that all of the keys are included.

import I18n from "@discord/i18n";
import { Dispatcher } from "@discord/modules";
import locales from "../locales.json";

export default class Strings {
	static strings = {};

	static subscribe() {
		this.setStrings();
		Dispatcher.subscribe("I18N_LOAD_SUCCESS", this.setStrings);
	}

	static setStrings() {
		this.strings = locales[I18n.getLocale()] ?? locales["en-US"];
	}

	static get(key) {
		return this.strings[key] ?? locales["en-US"][key];
	}

	static unsubscribe() {
		Dispatcher.unsubscribe("I18N_LOAD_SUCCESS", this.setStrings);
	}
}
