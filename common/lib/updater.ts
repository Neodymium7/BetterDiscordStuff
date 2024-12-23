import { Meta, Net, Logger, UI, Plugins, DOM, CloseNotice } from "betterdiscord";
import { writeFileSync } from "fs";
import { join } from "path";
import { getClasses } from "./utils/webpack";

interface Updater {
	closeUpdateNotice: CloseNotice | undefined;
	checkForUpdates(meta: Meta): void;
	closeNotice(): void;
}

const hoverClass = getClasses("anchorUnderlineOnHover")?.anchorUnderlineOnHover || "";

const findVersion = (pluginContents: string): string => {
	const lines = pluginContents.split("\n");
	const versionLine = lines.find((line) => line.includes("@version"))!;
	return versionLine.split(/\s+/).pop()!;
};

const updatePlugin = (name: string, newContents: string) => {
	const path = join(Plugins.folder, name + ".plugin.js");
	writeFileSync(path, newContents);
};

const showUpdateNotice = (name: string, version: string, newContents: string) => {
	const noticeElementHTML = `<span><a href="https://github.com/Neodymium7/BetterDiscordStuff/blob/main/${name}/${name}.plugin.js" target="_blank" class="${hoverClass}" style="color: #fff; font-weight: 700;">${name} v${version}</a> is available</span>`;
	const noticeElement = DOM.parseHTML(noticeElementHTML) as HTMLElement;
	UI.createTooltip(noticeElement.firstChild as HTMLElement, "View Source", { side: "bottom" });

	return UI.showNotice(noticeElement, {
		buttons: [
			{
				label: "Update",
				onClick: () => updatePlugin(name, newContents),
			},
		],
	});
};

export const Updater: Updater = {
	closeUpdateNotice: undefined,

	async checkForUpdates(meta: Meta) {
		const url = `https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/${meta.name}/${meta.name}.plugin.js`;

		const res = await Net.fetch(url);

		if (!res.ok) {
			Logger.error(`Failed to check for updates: ${res.status} - ${res.statusText}`);
			return;
		}

		const text = await res.text();
		const version = findVersion(text);

		if (version === meta.version) return;

		this.closeUpdateNotice = showUpdateNotice(meta.name, version, text);
	},

	closeNotice() {
		if (this.closeUpdateNotice) this.closeUpdateNotice();
	},
};
