import { useEffect, useState } from "react";
import { Data } from "betterdiscord";

type Override<T, U> = Omit<T, keyof U> & U;

type ValueOf<T> = T[keyof T];

type KeysOfType<O, T> = {
	[K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type SettingsObject = Record<string, any>;

/** A callback that is run when a setting is changed. */
type Listener<T> = (key: keyof T, value: ValueOf<T>) => void;

interface SettingsManager<T extends SettingsObject> {
	/**
	 * Adds a listener that runs when a setting is changed.
	 * @param listener A callback to run when a setting is changed. Takes two optional parameters: the key of the setting, and its new value.
	 * @returns A function to remove the listener.
	 */
	addListener(listener: Listener<T>): () => void;

	/**
	 * Removes all listeners. Used for cleanup from {@link addListener}. Should be run at plugin stop if any listeners were added and not removed.
	 */
	clearListeners(): void;

	/**
	 * A React hook that gets a the settings object as a stateful variable.
	 * @returns The settings object as a stateful value.
	 */
	useSettingsState(): T;
}

type Settings<T extends SettingsObject> = Override<SettingsManager<T>, T>;

/**
 * Creates a new `Settings` object with the given default settings.
 * @param defaultSettings An object containing the default settings.
 * @returns A `Settings` object.
 */
export function createSettings<T extends SettingsObject>(defaultSettings: T) {
	let settings: T = Data.load("settings");
	const listeners = new Set<Listener<T>>();

	if (!settings) {
		Data.save("settings", defaultSettings);
		settings = defaultSettings;
	}

	if (Object.keys(settings) !== Object.keys(defaultSettings)) {
		settings = { ...defaultSettings, ...settings };
	}

	let changed = false;
	for (const key in settings) {
		if (!(key in defaultSettings)) {
			delete settings[key];
			changed = true;
		}
	}
	if (changed) Data.save("settings", settings);

	const settingsManager: SettingsManager<T> = {
		addListener(listener: Listener<T>) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		clearListeners() {
			listeners.clear();
		},
		useSettingsState(): T {
			const [state, setState] = useState(settings);
			useEffect(() => {
				return settingsManager.addListener((key, value) => {
					setState((state) => ({ ...state, [key]: value }));
				});
			}, []);
			return state;
		},
	};

	for (const key in settings) {
		Object.defineProperty(settingsManager, key, {
			get() {
				return settings[key];
			},
			set(value) {
				settings[key] = value;
				Data.save("settings", settings);
				for (const listener of listeners) listener(key, value);
			},
			enumerable: true,
			configurable: false,
		});
	}

	return settingsManager as unknown as Settings<T>;
}

/**
 * A type that represents the keys of a `Settings` object (optionally with values of a given type).
 * @template S The `Settings` object.
 * @template T If given, will only supply the keys with values of that type.
 *
 * @example
 * ```ts
 * const Settings = createSettings({ foo: "bar", baz: 1 });
 *
 * type Setting = SettingsKey<typeof Settings>; // "foo" | "baz"
 * type StringSetting = SettingsKey<typeof Settings, string>; // "foo"
 * ```
 */
export type SettingsKey<S, T = any> = Exclude<KeysOfType<S, T>, keyof SettingsManager<SettingsObject>>;
