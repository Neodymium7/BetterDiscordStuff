/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 1.0.1
 * @description Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions. (Helps reduce clutter, especially with plugins like GameActivityToggle)
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
            "version": "1.0.1",
            "description": "Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions. (Helps reduce clutter, especially with plugins like GameActivityToggle)",
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
    const { Dropdown, SettingPanel, Switch } = Settings;

    const wrapperSelector = ".avatarWrapper-1B9FTW";
    const avatarSelector = ".avatar-1EWyVD.wrapper-1VLyxH";
    const settingsSelector = ".container-YkUktl .button-12Fmur:nth-last-child(1)";

    const statusButton = document.querySelector(wrapperSelector);
    let userAvatar = document.querySelector(avatarSelector);
    let tooltip;

    return class AvatarSettingsButton extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                showTooltip: false,
                click: 1,
                contextmenu: 3,
                middleclick: 2
            };
        }

        onStart() {
            BdApi.injectCSS("css", settingsSelector + "{display:none}" + wrapperSelector + "{pointer-events: none}" + avatarSelector + "{pointer-events: all}");
            this.addEventListeners();
            this.addTooltip();
        }

        onStop() {
            BdApi.clearCSS("css");
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

        openContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector(settingsSelector).dispatchEvent(new MouseEvent("contextmenu", {bubbles: true, clientX: e.clientX, clientY: (screen.height - 12)}));
            
            if (document.getElementById("status-picker")) {
                statusButton.click();
            }
        }

        openStatusPicker(e) {
            e.preventDefault();
            e.stopPropagation();
            statusButton.click();
            if (tooltip) tooltip.hide();
        }

        doNothing(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        addEventListeners() {
            const actions = [this.doNothing, this.openSettings, this.openContextMenu, this.openStatusPicker];
            userAvatar.addEventListener("click", actions[this.settings.click]);
            userAvatar.addEventListener("contextmenu", actions[this.settings.contextmenu]);
            userAvatar.addEventListener("mousedown", e => {if (e.button === 1) actions[this.settings.middleclick](e);});
        }

        addTooltip() {
            const tooltips = ["", "User Settings", "Settings Shortcuts", "Set Status"];
            if (this.settings.showTooltip && this.settings.click !== 0) {
                tooltip = new Tooltip(userAvatar, tooltips[this.settings.click]);
            }
        }

        refreshAvatar() {
            let newNode = userAvatar.cloneNode(true);
            userAvatar.parentNode.replaceChild(newNode, userAvatar);
            userAvatar = newNode;
        }

        getSettingsPanel() {
            return SettingPanel.build(() => {
                    this.saveSettings();
                    this.refreshAvatar();
                    this.addEventListeners();
                    this.addTooltip();
                },
                new Dropdown("Click", "What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can use the Ctrl + , shortcut.", this.settings.click, [
                    {label: "Settings (Default)", value: 1},
                    {label: "Settings Context Menu", value: 2},
                    {label: "Status Picker", value: 3},
                    {label: "Nothing", value: 0}
                ], i => {this.settings.click = i;}),
                new Dropdown("Right Click", "What opens when right clicking on the user avatar.", this.settings.contextmenu, [
                    {label: "Settings", value: 1},
                    {label: "Settings Context Menu", value: 2},
                    {label: "Status Picker (Default)", value: 3},
                    {label: "Nothing", value: 0}
                ], i => {this.settings.middleclick = i;}),
                new Dropdown("Middle Click", "What opens when middle clicking on the username.", this.settings.middleclick, [
                    {label: "Settings", value: 1},
                    {label: "Settings Context Menu (Default)", value: 2},
                    {label: "Status Picker", value: 3},
                    {label: "Nothing", value: 0}
                ], i => {this.settings.middleclick = i;}),
				new Switch("Tooltip", "Show tooltip when hovering over user avatar.", this.settings.showTooltip, (i) => {this.settings.showTooltip = i;})
			);
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/