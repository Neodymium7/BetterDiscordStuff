import { Data, UI, Meta } from "betterdiscord";

type Changelog = {
	title: string;
	type?: string;
	items: string[];
}[];

export function showChangelog(changes: Changelog, meta: Meta) {
	const changelogVersion = Data.load("changelogVersion");

	if (meta.version === changelogVersion) return;

	UI.showChangelogModal({
		title: meta.name,
		subtitle: meta.version,
		changes,
	});

	Data.save("changelogVersion", meta.version);
}
