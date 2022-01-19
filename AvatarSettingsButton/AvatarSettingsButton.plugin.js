/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 0.0.3
 * @description Moves the User Settings button to the user avatar, with the status picker still available on right click. (Helps reduce clutter, especially with plugins like GameActivityToggle)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
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
            "name": "AvatarSettingsButton",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "0.0.3",
            "description": "Moves the User Settings button to the user avatar, with the status picker still available on right click. (Helps reduce clutter, especially with plugins like GameActivityToggle)",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
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

    const { Settings, Tooltip } = Library;
    const { SettingPanel, Switch } = Settings;

    const settingsSelector = ".container-YkUktl .button-12Fmur:nth-last-child(1)";
    const statusButton = document.querySelector(".avatarWrapper-1B9FTW");
    let userAvatar = document.querySelector(".avatar-1EWyVD.wrapper-1VLyxH");
    let tooltip;

    return class AvatarSettingsButton extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                showTooltip: false
            };
        }

        onStart() {
            document.querySelector(settingsSelector).style.display = "none";
            this.addEventListeners();
            this.addTooltip();
        }

        onStop() {
            document.querySelector(settingsSelector).style.display = "flex";
            this.refreshAvatar();
        }

        openSettings(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector(settingsSelector).click();
            
            if (document.getElementById("status-picker")) {
                statusButton.click();
            }
        }

        openStatusPicker() {
            statusButton.click();
            tooltip.hide();
        }

        addEventListeners() {
            userAvatar.addEventListener("click", this.openSettings);
            userAvatar.addEventListener("contextmenu", this.openStatusPicker);
        }

        addTooltip() {
            if (this.settings.showTooltip) {
                tooltip = new Tooltip(userAvatar, "User Settings");
            }
        }

        refreshAvatar() {
            let newNode = userAvatar.cloneNode(true);
            userAvatar.parentNode.replaceChild(newNode, userAvatar);
            userAvatar = newNode;
        }

        getSettingsPanel() {
            return SettingPanel.build(this.saveSettings.bind(this),
				new Switch("Tooltip", "Show tooltip when hovering over user avatar.", this.settings.showTooltip, (i) => {
					this.settings.showTooltip = i;

                    this.refreshAvatar();
                    this.addEventListeners();
                    this.addTooltip();
				})
			);
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/