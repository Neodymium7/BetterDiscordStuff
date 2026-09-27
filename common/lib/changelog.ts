import { Data, UI } from "betterdiscord";

export function showChangelog(changes: BetterDiscord.ChangelogEntry[], meta: BetterDiscord.Addon) {
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
