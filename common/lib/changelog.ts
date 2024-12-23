import { Data, UI, Meta, Changes } from "betterdiscord";

export function showChangelog(changes: Changes[], meta: Meta) {
	if (!changes || changes.length == 0) return;

	const changelogVersion = Data.load("changelogVersion");

	if (meta.version === changelogVersion) return;

	UI.showChangelogModal({
		title: meta.name,
		subtitle: meta.version,
		changes,
	});

	Data.save("changelogVersion", meta.version);
}
