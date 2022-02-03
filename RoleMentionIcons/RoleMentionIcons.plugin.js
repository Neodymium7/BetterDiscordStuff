/**
 * @name RoleMentionIcons
 * @author Neodymium
 * @version 1.0.1
 * @description Displays icons next to role mentions.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/RoleMentionIcons/RoleMentionIcons.plugin.js
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

module.exports = (() => {
    const config = {
        "info": {
            "name": "RoleMentionIcons",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "1.0.1",
            "description": "Displays icons next to role mentions.",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/RoleMentionIcons/RoleMentionIcons.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/RoleMentionIcons/RoleMentionIcons.plugin.js"
        },
        "main": "index.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const { SettingPanel, Switch } = Library.Settings;

    const People = BdApi.findModuleByDisplayName("People");

    return class RoleMentionIcons extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                everyone: true,
                here: true
            };
        }

        onStart() {
            BdApi.Patcher.after("RoleMentionIcons", BdApi.findModule(m => m?.default.displayName === "RoleMention"), "default", (_, [props], ret) => {
                const isEveryone = props.roleName === "@everyone";
                const isHere = props.roleName === "@here";
                if (!(!this.settings.everyone && isEveryone) && !(!this.settings.here && isHere)) {
                    props.children.push(BdApi.React.createElement("div", {"class": "role-mention-icon"}, BdApi.React.createElement(People)));
                }
            });
            BdApi.injectCSS("RoleMentionIcons", `
            .role-mention-icon svg {
                position: relative;
                bottom: -2px;
                width: 14px;
                height: 14px;
                margin-left: 4px;
            }
            .role-mention-icon {
                display: inline;
            }`);
        }

        onStop() {
            BdApi.Patcher.unpatchAll("RoleMentionIcons");
            BdApi.clearCSS("RoleMentionIcons");
        }

        getSettingsPanel() {
            return SettingPanel.build(this.saveSettings.bind(this),
                new Switch("@eveyone", "Shows icons on \"@everyone\" mentions.", this.settings.everyone, (i) => {this.settings.everyone = i;}),
                new Switch("@here", "Shows icons on \"@here\" mentions.", this.settings.here, (i) => {this.settings.here = i;}),
			);
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/