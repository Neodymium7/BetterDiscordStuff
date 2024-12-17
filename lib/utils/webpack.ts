import { Webpack, Logger, SearchOptions, ModuleFilter } from "betterdiscord";
import React from "react";

interface IconProps {
	width?: string;
	height?: string;
	size?: string;
	className?: string;
	color?: string;
}

type Icon = (props: IconProps) => React.ReactNode;

/**
 * Options for the `expect` function.
 * - `name`: The name of the module (for error logging)
 * - `fatal`: Whether or not to stop plugin execution when the module is not found
 * - `fallback`: A fallback value to use when the module is not found
 * - `onError`: A callback function that is run when the module is not found
 */
type ExpectOptions<T> = {
	name: string;
	fatal?: boolean;
	fallback?: T;
	onError?: () => void;
};

type ExpectOptionsFallback<T> = ExpectOptions<T> & {
	fallback: T;
};

type ExpectOptionsFatal<T> = ExpectOptions<T> & {
	fatal: true;
};

/**
 * Options for the `expectModule` function. Takes all options for a normal `getModule` query as well as:
 * - `filter`: A function to use to filter modules.
 * - `name`: The name of the module (for error logging)
 * - `fatal`: Whether or not to stop plugin execution when the module is not found
 * - `fallback`: A fallback value to use when the module is not found
 * - `onError`: A callback function that is run when the module is not found
 */
type ExpectOptionsWithFilter<T> = ExpectOptions<T> &
	SearchOptions<boolean> & {
		filter: ModuleFilter;
	};

/**
 * Gets a module of classes using desired classes.
 * @param classes An array of desired classes (you may need to add other classes to find the correct module).
 * @returns An object of classes.
 */
export function getClasses<T extends string>(...classes: T[]): { [key in T]: string } | undefined {
	return Webpack.getModule((m) => Webpack.Filters.byKeys(...classes)(m) && typeof m[classes[0]] == "string");
}

/**
 * Gets an object of selectors using desired classes to find the class module.
 * @param classes An array of desired classes (you may need to add other classes to find the correct module).
 * @returns An object of selectors.
 */
export function getSelectors<T extends string>(...classes: T[]): { [key in T]: string } | undefined {
	const module = getClasses(...classes);

	if (!module) return undefined;

	return Object.keys(module).reduce((obj, key) => {
		obj[key] = "." + module[key as T].replaceAll(" ", ".");
		return obj;
	}, {} as any);
}

/**
 * Gets an SVG icon component using a search string, such as a portion of the icon's SVG path.
 * @param searchString - A string to search for.
 * @returns The icon component.
 */
export function getIcon(searchString: string): Icon | undefined {
	const filter: ModuleFilter = (m) => Webpack.Filters.byStrings(searchString, '"svg"')(m) && typeof m === "function";

	return Webpack.getModule(filter, {
		searchExports: true,
	});
}

export function expect<T>(object: T, options: ExpectOptionsFallback<T>): NonNullable<T>;
export function expect<T>(object: T, options: ExpectOptionsFatal<T>): NonNullable<T>;
export function expect<T>(object: T, options: ExpectOptions<T>): T | undefined;
export function expect<T>(object: T, options: ExpectOptions<T>): T | undefined {
	if (object) return object;

	const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
	const errorMessage = `Module ${options.name} not found.${fallbackMessage}\n\nContact the plugin developer to inform them of this error.`;

	Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);

	return options.fallback!;
}

/**
 * Finds a module using a filter function, and handles the error if the module is not found.
 * @param options Options for the module search and error handling, including a filter.
 * @returns The found module or the fallback if the module cannot be found.
 */
export function expectModule<T>(options: ExpectOptionsWithFilter<T>) {
	return expect<T>(Webpack.getModule(options.filter, options), options);
}

/**
 * Gets a module of classes using desired classes. Handles when no module is found.
 * @param name A module name to use for error messages.
 * @param classes An array of desired classes (you may need to add other classes to find the correct module).
 * @returns An object of classes.
 */
export function expectClasses<T extends string>(name: string, classes: T[]) {
	return expect(getClasses(...classes), {
		name,
		fallback: classes.reduce((obj, key) => {
			obj[key] = "unknown-class";
			return obj;
		}, {} as { [key in T]: string }),
	});
}

/**
 * Gets an object of selectors using desired classes to find the class module. Handles when no module is found.
 * @param name A module name to use for error messages.
 * @param classes An array of desired classes (you may need to add other classes to find the correct module).
 * @returns An object of selectors.
 */
export function expectSelectors<T extends string>(name: string, classes: T[]) {
	return expect(getSelectors(...classes), {
		name,
	});
}

/**
 * Gets an SVG icon component using a search string, such as a portion of the icon's SVG path. Handles when no module is found.
 * @param name - The name of the icon
 * @param searchString - A string to search for.
 * @returns The icon component.
 */
export function expectIcon(name: string, searchString: string) {
	return expect(getIcon(searchString), {
		name,
		fallback: (_props: IconProps) => null,
	});
}

/**
 * Generates a Webpack filter to get a module by its Webpack id.
 * @param id The Webpack module id.
 * @returns The generated filter.
 */
export function byId(id: string): ModuleFilter {
	return (_e, _m, i) => i === id;
}

/**
 * Generates a Webpack filter to get a module with property values that satisfy a set of filters.
 * @param filters Filters that property values on the module must satisfy.
 * @returns The generated filter.
 */
export function byValues(...filters: ModuleFilter[]): ModuleFilter {
	return (e, m, i) => {
		let match = true;

		for (const filter of filters) {
			if (!Object.values(e).some((v) => filter(v, m, i))) {
				match = false;
				break;
			}
		}

		return match;
	};
}

/**
 * Generates a Webpack filter to get a module that contains provided strings in its source.
 * @param strings - The strings to search for.
 * @returns The generated filter.
 */
export function bySourceStrings(...strings: string[]): ModuleFilter {
	return (_e, _m, i) => {
		const moduleSource: string = Webpack.modules[i!].toString();
		let match = true;

		for (const string of strings) {
			if (!moduleSource.includes(string)) {
				match = false;
				break;
			}
		}

		return match;
	};
}
