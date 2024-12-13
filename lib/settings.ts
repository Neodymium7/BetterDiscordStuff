import { useEffect, useState } from "react";
import { Data } from "betterdiscord";

type ValueOf<T> = T[keyof T];

type KeysOfType<O, T> = {
	[K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type SettingsObject = Record<string, any>;

/** A callback that is run when a setting is changed. */
type Listener<T> = (key: keyof T, value: ValueOf<T>) => void;

export class SettingsManager<T extends SettingsObject> {
	private settings: T = Data.load("settings");
	private listeners = new Set<Listener<T>>();

	/**
	 * Creates a new `SettingsManager` object with the given default settings.
	 * @param defaultSettings An object containing the default settings.
	 * @returns A `SettingsManager` object.
	 */
	constructor(defaultSettings: T) {
		if (!this.settings) {
			Data.save("settings", defaultSettings);
			this.settings = defaultSettings;
			return;
		}

		if (Object.keys(this.settings) !== Object.keys(defaultSettings)) {
			this.settings = { ...defaultSettings, ...this.settings };

			let changed = false;
			for (const key in this.settings) {
				if (!(key in defaultSettings)) {
					delete this.settings[key];
					changed = true;
				}
			}
			if (changed) Data.save("settings", this.settings);
		}
	}

	/**
	 * Adds a listener that runs when a setting is changed.
	 * @param listener A callback to run when a setting is changed. Takes two optional parameters: the key of the setting, and its new value.
	 * @returns A function to remove the listener.
	 */
	addListener(listener: Listener<T>) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Removes all listeners. Used for cleanup from {@link addListener}. Should be run at plugin stop if any listeners were added and not removed.
	 */
	clearListeners() {
		this.listeners.clear();
	}

	/**
	 * A React hook that gets a the settings object as a stateful variable.
	 * @param keys Settings keys to include in the state object.
	 * @returns The settings object as a stateful value.
	 */
	useSettingsState<K extends keyof T = keyof T>(...keys: K[]): { [Key in K]: T[Key] } {
		let initialState = this.settings;
		if (keys.length) initialState = Object.fromEntries(keys.map((key) => [key, initialState[key]])) as T[K];

		const [state, setState] = useState(initialState);
		useEffect(() => {
			return this.addListener((key, value) => {
				if (!keys.length || keys.includes(key as any)) setState((state) => ({ ...state, [key]: value }));
			});
		}, []);
		return state;
	}

	/**
	 * Gets the value of a setting.
	 * @param key The setting key.
	 * @returns The setting's current value.
	 */
	get<K extends keyof T>(key: K) {
		return this.settings[key];
	}

	/**
	 * Sets the value of a setting.
	 * @param key The setting key.
	 * @param value The new setting value.
	 */
	set<K extends keyof T>(key: K, value: T[K]) {
		this.settings[key] = value;
		Data.save("settings", this.settings);
		for (const listener of this.listeners) listener(key, value);
	}
}

type Settings<S extends SettingsManager<any>> = S extends SettingsManager<infer T> ? T : never;

/**
 * A type that represents the keys of a `SettingsManager` object (optionally with values of a given type).
 * @template S The type of the `SettingsManager` object.
 * @template T If given, will only supply the keys with values of that type.
 *
 * @example
 * ```ts
 * const Settings = new SettingsManager({ foo: "bar", baz: 1 });
 *
 * type Setting = SettingsKey<typeof Settings>; // "foo" | "baz"
 * type StringSetting = SettingsKey<typeof Settings, string>; // "foo"
 * ```
 */
export type SettingsKey<S extends SettingsManager<any>, T = any, U = Settings<S>> = KeysOfType<U, T>;
