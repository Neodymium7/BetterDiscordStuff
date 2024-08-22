import { Webpack } from "betterdiscord";
import { Logger } from "../logger";
import { SearchOptions } from "bdapi";

type Filter = (e: any, m: any, i: string) => boolean;

interface IconProps {
	width?: string;
	height?: string;
	size?: string;
	className?: string;
	color?: string;
}

/**
 * Options for the `expectModule` function. Takes all options for a normal `getModule` query as well as:
 * - `name`: The name of the module (for error logging)
 * - `fatal`: Whether or not to stop plugin execution when the module is not found
 * - `fallback`: A fallback value to use when the module is not found
 * - `onError`: A callback function that is run when the module is not found
 */
type ExpectOptions<T> = {
	name?: string;
	fatal?: boolean;
	fallback?: T;
	onError?: () => void;
} & SearchOptions<boolean>;

/**
 * Options for the `expectModule` function. Takes all options for a normal `getModule` query as well as:
 * - `filter`: A function to use to filter modules.
 * - `name`: The name of the module (for error logging)
 * - `fatal`: Whether or not to stop plugin execution when the module is not found
 * - `fallback`: A fallback value to use when the module is not found
 * - `onError`: A callback function that is run when the module is not found
 */
type ExpectOptionsWithFilter<T> = ExpectOptions<T> & { filter: Filter };

/**
 * Finds a module using a filter function, and handles the error if the module is not found.
 * @param options Options for the module search and error handling, including a filter.
 * @returns The found module or the fallback if the module cannot be found.
 */
export function expectModule<T>(options: ExpectOptionsWithFilter<T>): T;
/**
 * Finds a module using a filter function, and handles the error if the module is not found.
 * @param filter A function to use to filter modules.
 * @param options Options for the module search and error handling.
 * @returns The found module or the fallback if the module cannot be found.
 */
export function expectModule<T>(filter: Filter, options?: ExpectOptions<T>): T;
export function expectModule<T>(filterOrOptions: Filter | ExpectOptionsWithFilter<T>, options?: ExpectOptions<T>): T {
	let filter: Filter;
	if (typeof filterOrOptions === "function") {
		filter = filterOrOptions;
	} else {
		filter = filterOrOptions.filter;
		options = filterOrOptions;
	}

	const found = Webpack.getModule(filter, options);
	if (found) return found;

	const name = options.name ? `'${options.name}'` : `query with filter '${filter.toString()}'`;
	const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
	const errorMessage = `Module ${name} not found.${fallbackMessage}\n\nContact the plugin developer to inform them of this error.`;

	Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);

	return options.fallback;
}

/**
 * Gets a module of classes using desired classes. Handles when no module is found.
 * @param name A module name to use for error messages.
 * @param classes An array of desired classes (you may need to add other classes to find the correct module).
 * @returns An object of classes.
 */
export function getClasses<T extends string>(name: string, classes: T[]) {
	return expectModule({
		filter: Webpack.Filters.byProps(...classes),
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
export function getSelectors<T extends string, U extends { [key in T]: string }>(name: string, classes: T[]) {
	const module = expectModule({
		filter: Webpack.Filters.byProps(...classes),
		name,
		fallback: {}, // Use empty object to print "using fallback" message
	}) as U;

	if (Object.keys(module).length === 0)
		return classes.reduce((obj, key) => {
			obj[key] = null;
			return obj;
		}, {} as U);

	return Object.keys(module).reduce((obj, key) => {
		obj[key] = `.${module[key].replaceAll(" ", ".")}`;
		return obj;
	}, {} as U);
}

/**
 * Generates a Webpack filter to get a Flux store by its name.
 * @param name The name of the store.
 * @returns The generated filter.
 * @deprecated use `getStore` instead.
 */
export function store(name: string) {
	return (m: any) => m._dispatchToken && m.getName() === name;
}

/**
 * Generates a Webpack filter to get a module by its Webpack id.
 * @param id The Webpack module id.
 * @returns The generated filter.
 */
export function byId(id: string) {
	return (_e: any, _m: any, i: string) => i === id;
}

/**
 * Generates a Webpack filter to get a module with property values that satisfy a set of filters.
 * @param filters Filters that property values on the module must satisfy.
 * @returns The generated filter.
 */
export function byValues(...filters: Filter[]) {
	return (e: any, m: any, i: string) => {
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
export function bySourceStrings(...strings: string[]) {
	return (_e: any, _m: any, i: string) => {
		// @ts-ignore
		const moduleSource: string = Webpack.modules[i].toString();
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

/**
 * Gets an SVG icon component using a search string, such as a portion of the icon's SVG path. Handles when no module is found.
 * @param name - The name of the icon
 * @param searchString - A string to search for.
 * @returns The icon component.
 */
export function getIcon(name: string, searchString: string): (props: IconProps) => JSX.Element {
	return expectModule<any>({
		filter: Webpack.Filters.byStrings(searchString),
		name,
		fallback: (_props: IconProps) => null,
		searchExports: true,
	});
}
