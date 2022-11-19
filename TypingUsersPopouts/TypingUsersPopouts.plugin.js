/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.2.1
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
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
		name: "TypingUsersPopouts",
		authors: [{ name: "Neodymium" }],
		version: "1.2.1",
		description: "Opens the user's popout when clicking on a name in the typing area.",
		github: "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js"
	},
	changelog: [{
		title: "Fixed",
		type: "fixed",
		items: ["Fixed crashing when clicking on a typing user's name."]
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
	const { DiscordModules, DiscordSelectors, Patcher, ReactComponents, Utilities } = Library;

	const { React, Webpack, injectCSS, clearCSS } = BdApi
	const { Filters: { byStrings }, getModule } = Webpack;

	const UserPopout = getModule((e) => e.type?.toString().includes('["userId"]'));
	const Popout = getModule(byStrings(".animationPosition"));

	const nameSelector = `${DiscordSelectors.Typing.typing} strong`;

	const { UserStore, RelationshipStore } = DiscordModules;

	return class TypingUsersPopouts extends Plugin {
		onStart() {
			injectCSS(
				"TypingUsersPopouts",
				`${nameSelector} { cursor: pointer; } ${nameSelector}:hover { text-decoration: underline; }`
			);
			this.patch();
		}

		async patch() {
			const TypingUsers = await ReactComponents.getComponent(
				"TypingUsers",
				DiscordSelectors.Typing.typing,
				(c) => c.prototype?.getCooldownTextStyle
			);
			Patcher.after(TypingUsers.component.prototype, "render", (thisObject, _, ret) => {
				const typingUsersIds = Object.keys(thisObject.props.typingUsers).filter(
					(id) => id !== UserStore.getCurrentUser().id && !RelationshipStore.isBlocked(id)
				);
				const text = Utilities.findInReactTree(ret, (e) => e.children?.length && e.children[0]?.type === "strong");
				if (!text) return ret;

				let i = 0;
				text.children = text.children.map((e) => {
					if (e.type !== "strong") return e;
					const userId = typingUsersIds[i++];

					return React.createElement(
						Popout, 
						{ 
							align: "left", 
							position: "top", 
							key: userId, 
							renderPopout: () => React.createElement(UserPopout, { userId, guildId: thisObject.props.channel.guild_id }) 
						}, 
						(props) => React.createElement("strong", { ...props, ...e.props })
					);
				});
			});
		}

		onStop() {
			clearCSS("TypingUsersPopouts");
			Patcher.unpatchAll();
		}
	}
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };
/*@end@*/