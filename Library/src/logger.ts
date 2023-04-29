import { name } from "meta";

/**
 * A logger to write messages, warnings, and errors to the console labeled with the plugin's name.
 */
export class Logger {
	private static _log(type: "log" | "warn" | "error", message: string) {
		console[type](`%c[${name}]`, "color: #3a71c1; font-weight: 700;", message);
	}

	static log(message: string) {
		this._log("log", message);
	}

	static warn(message: string) {
		this._log("warn", message);
	}

	static error(message: string) {
		this._log("error", message);
	}
}
