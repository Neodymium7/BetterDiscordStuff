import { Meta, Net, Logger, UI, Plugins, DOM } from "betterdiscord";
import { writeFileSync } from "fs";
import { join } from "path";

const findVersion = (pluginContents: string) => {
	const lines = pluginContents.split("\n");
	const versionLine = lines.find((line) => line.includes("@version"));
	return versionLine.split(/\s+/).pop();
};

const updatePlugin = (name: string, newContents: string) => {
	const path = join(Plugins.folder, name + ".plugin.js");
	writeFileSync(path, newContents);
};

const showUpdateNotice = (name: string, version: string, newContents: string) => {
	const noticeElement = document.createElement("span");

	const linkElementStyle = "color: #fff; font-weight: 700;";
	const linkElementHTML = `<a href="https://github.com/Neodymium7/BetterDiscordStuff/blob/main/${name}/${name}.plugin.js" target="_blank" style="${linkElementStyle}">${name} v${version}</a>`;
	const linkElement = DOM.parseHTML(linkElementHTML) as HTMLElement;
	const setStyle = (style) => linkElement.setAttribute("style", style);
	linkElement.addEventListener("mouseenter", () => setStyle(linkElementStyle + " text-decoration: underline;"));
	linkElement.addEventListener("mouseleave", () => setStyle(linkElementStyle));
	UI.createTooltip(linkElement, "View Source", { side: "bottom" });
	noticeElement.appendChild(linkElement);

	noticeElement.appendChild(document.createTextNode(" is available"));

	const closeNotice = UI.showNotice(noticeElement, {
		buttons: [
			{
				label: "Update",
				onClick: () => {
					updatePlugin(name, newContents);
					closeNotice();
				},
			},
		],
	});

	return closeNotice;
};

export const Updater = {
	async checkForUpdates(meta: Meta) {
		const url = `https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/${meta.name}/${meta.name}.plugin.js`;

		const res = await Net.fetch(url);

		if (!res.ok) {
			Logger.error(`Failed to check for updates: ${res.status} - ${res.statusText}`);
			return;
		}

		const text = await res.text();
		const version = findVersion(text);

		if (version <= meta.version) return;

		this.closeUpdateNotice = showUpdateNotice(meta.name, version, text);
	},

	closeNotice() {
		if (this.closeUpdateNotice) this.closeUpdateNotice();
	},
};
