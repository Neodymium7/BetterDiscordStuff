/**
 * Replaces placeholders in a string with corresponding values from an object.
 * @param string The string to parse.
 * @param parseObject An object containing the keys to replace and their corresponding values.
 * @returns The parsed string.
 */
export function parseString(string: string, parseObject: Record<string, string>) {
	const delimiters = ["{{", "}}"];

	for (const key in parseObject) {
		string = string.replace(new RegExp(delimiters[0] + key + delimiters[1], "g"), parseObject[key]);
	}
	return string;
}

/**
 * Parses a string with React elements.
 * @param string The string to parse.
 * @param parseObject An object containing the keys to replace and their corresponding React elements.
 * @returns An array of React elements from the parsed string.
 */
export function parseStringReact(string: string, parseObject: Record<string, React.ReactNode>) {
	const delimiters = ["{{", "}}"];
	const splitRegex = new RegExp(`(${delimiters[0]}.+?${delimiters[1]})`, "g");
	const itemRegex = new RegExp(delimiters[0] + "(.+)" + delimiters[1]);

	const parts = string.split(splitRegex).filter(Boolean);
	return parts.map((part) => {
		if (!itemRegex.test(part)) return part;
		const key = part.replace(itemRegex, "$1");
		return parseObject[key] ?? part;
	});
}
