/**
 * @name RoleMentionIcons
 * @author Neodymium
 * @version 1.1.4
 * @description Displays icons next to role mentions.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/RoleMentionIcons/RoleMentionIcons.plugin.js
 * @invite fRbsqH87Av
 */

/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

const config = {
	info: {
		name: "RoleMentionIcons",
		authors: [{ name: "Neodymium" }],
		version: "1.1.4",
		description: "Displays icons next to role mentions.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/RoleMentionIcons/RoleMentionIcons.plugin.js"
	},
	changelog: [{
		title: "Fixed",
		type: "fixed",
		items: ["Fixed potential error message spam in console."]
	}]
};

if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
            });
        }
    });
}

function buildPlugin([Plugin, Library]) {
    const { Filters: { byProps }, getModule } = BdApi.Webpack;
	
	const { SettingPanel, Switch } = Library.Settings;
	
	const GuildStore = getModule(byProps("getGuildCount"));
	const roleMention = getModule(byProps("roleMention")).roleMention.split(" ")[0];
	
	const peopleSVG = (() => {
		const element = document.createElement("div");
		element.innerHTML = '<svg class="role-mention-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14" width="14"><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z" fill="currentColor" /><path d="M20.0001 20.006H22.0001V19.006C22.0001 16.4433 20.2697 14.4415 17.5213 13.5352C19.0621 14.9127 20.0001 16.8059 20.0001 19.006V20.006Z" fill="currentColor" /><path d="M14.8834 11.9077C16.6657 11.5044 18.0001 9.9077 18.0001 8.00598C18.0001 5.96916 16.4693 4.28218 14.4971 4.0367C15.4322 5.09511 16.0001 6.48524 16.0001 8.00598C16.0001 9.44888 15.4889 10.7742 14.6378 11.8102C14.7203 11.8418 14.8022 11.8743 14.8834 11.9077Z" fill="currentColor" /></svg>';
		return element.firstChild;
	})();
	
	// From https://github.com/rauenzi/BetterDiscordAddons/blob/692abbd1877ff6d837dc8a606767d019e52ebe23/Plugins/RoleMembers/RoleMembers.plugin.js#L60-L61
	const from = arr => arr && arr.length > 0 && Object.assign(...arr.map(([k, v]) => ({ [k]: v })));
	const filter = (obj, predicate) => from(Object.entries(obj).filter((o) => { return predicate(o[1]); }));
	
	const getProps = (el, filter) => {
		const reactInstance = BdApi.getInternalInstance(el);
		let current = reactInstance?.return;
		while (current) {
			if (current.pendingProps && filter(current.pendingProps)) return current.pendingProps;
			current = current.return;
		}
		return null;
	};
	
	const getIconElement = (roleId, roleIcon) => {
		const icon = document.createElement("img");
		icon.className = "role-mention-icon";
		icon.setAttribute("style", "border-radius: 3px; object-fit: contain;");
		icon.width = icon.height = 16;
		icon.src = `https://cdn.discordapp.com/role-icons/${roleId}/${roleIcon}.webp?size=24&quality=lossless`;
		return icon;
	};
	
	return class RoleMentionIcons extends Plugin {
		constructor() {
			super();
			this.defaultSettings = {
				everyone: true,
				here: true,
				showRoleIcons: true
			};
			this.clearCallbacks = new Set();
		}
	
		onStart() {
			BdApi.injectCSS("RoleMentionIcons", ".role-mention-icon { position: relative; top: 2px; margin-left: 4px; }");

			const elements = Array.from(document.getElementsByClassName(roleMention));
			this.processElements(elements);
		}
	
		observer({ addedNodes }) {
			for (const node of addedNodes) {
				if (node.nodeType === Node.TEXT_NODE) continue;
				const elements = Array.from(node.getElementsByClassName(roleMention));
				this.processElements(elements);
			}
		}
	
		processElements(elements) {
			if (!elements.length) return;

			for (const element of elements) {
				const props = getProps(element, e => e.roleName || e.roleId);
				if (!props) return;
				
				const isEveryone = props.roleName === "@everyone";
				const isHere = props.roleName === "@here";
				let role;
				if (props.guildId) {
					role = filter(GuildStore.getGuild(props.guildId)?.roles, r => r.id === props.roleId);
					role = role[Object.keys(role)[0]];
				}
				if ((this.settings.everyone || !isEveryone) && (this.settings.here || !isHere)) {
					if (role?.icon && this.settings.showRoleIcons) {
						const icon = getIconElement(role.id, role.icon);
						element.appendChild(icon);
						this.clearCallbacks.add(() => icon.remove());
					} else {
						const icon = peopleSVG.cloneNode(true);
						element.appendChild(icon);
						this.clearCallbacks.add(() => icon.remove());
					}
				}
			}
		}

		clearIcons() {
			this.clearCallbacks.forEach(callback => callback());
			this.clearCallbacks.clear();
		}
	
		onStop() {
			BdApi.clearCSS("RoleMentionIcons");
			this.clearIcons();
		}
	
		getSettingsPanel() {
			return SettingPanel.build(
				() => {
					this.saveSettings();
					this.clearIcons();

					const elements = Array.from(document.getElementsByClassName(roleMention));
					this.processElements(elements);
				},
				new Switch("@everyone", 'Shows icons on "@everyone" mentions.', this.settings.everyone, i => this.settings.everyone = i),
				new Switch("@here", 'Shows icons on "@here" mentions.', this.settings.here, i => this.settings.here = i),
				new Switch("Role Icons", "Shows Role Icons instead of default icon when applicable.", this.settings.showRoleIcons, i => this.settings.showRoleIcons = i)
			);
		}
	};
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };
/*@end@*/