/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 1.1.0
 * @description Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions
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
            "version": "1.1.0",
            "description": "Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
        },
        "changelog": [
            {"title": "Improved", "type": "improved", "items": ["Rewrote the plugin", "Now works with new Account Profile Popout Experiment"]},
        ],
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

    const { DiscordSelectors, DiscordModules, ReactComponents, Settings } = Library;
    const { Dropdown, SettingPanel, Switch } = Settings;
    const TooltipContainer = BdApi.findModuleByProps("TooltipContainer").TooltipContainer;

    const settingsSelector = `${DiscordSelectors.AccountDetails.container} button:nth-last-child(1)`;

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
            BdApi.injectCSS("AvatarSettingsButton", `
                ${settingsSelector}{
                    display: none
                }
                .avatarSettingsButtonTooltipExperiment {
                    margin-left: -2px;
                    min-width: 120px;
                    padding-left: 2px;
                    padding-right: 8px;
                }
                .avatarSettingsButtonTooltipExperiment ${DiscordSelectors.AccountDetails.avatarWrapper} {
                    margin-right: 0;
                }
            `);
            this.patchAccountArea();
        }

        async patchAccountArea() {
            const Account = await ReactComponents.getComponentByName("Account", DiscordSelectors.AccountDetails.container);
            BdApi.Patcher.after("AvatarSettingsButton", Account.component.prototype, "render", (thisObject, _, ret) => {
                const renderAvatar = ret.props.children[0].props.children[0].props.children;
                ret.props.children[0].props.children[0].props.children = (avatarProps) => {
                    const avatar = Reflect.apply(renderAvatar, thisObject, [avatarProps]);
                    const renderPopout = avatar.props.children.props.children;
                    avatar.props.children.props.children = (popoutProps) => {
                        const popout = Reflect.apply(renderPopout, thisObject, [popoutProps]);

                        const openStatusPicker = popout.props.onClick;
                        const openSettings = (e) => {
                            DiscordModules.UserSettingsWindow.setSection("My Account");
                            DiscordModules.UserSettingsWindow.open();
                            if (document.querySelector("#status-picker")) openStatusPicker(e);
                        }
                        const openContextMenu = (e) => {
                            document.querySelector(settingsSelector).dispatchEvent(new MouseEvent("contextmenu", {bubbles: true, clientX: e.clientX, clientY: (screen.height - 12)}));
                            if (document.querySelector("#status-picker")) openStatusPicker(e);
                        }
                        const actions = [null, openSettings, openContextMenu, openStatusPicker];
                        const tooltips = ["", "User Settings", "Settings Shortcuts", "Set Status"];
                        const profilePopout = document.querySelector(".withTagAsButton-OsgQ9L") ? true : false;

                        popout.props.onClick = actions[this.settings.click];
                        popout.props.onContextMenu = actions[this.settings.contextmenu];
                        popout.props.onMouseUp = (e) => {
                            if (e.button === 1) actions[this.settings.middleclick](e);
                        };
                        if (this.settings.showTooltip && this.settings.click !== 0) {
                            return BdApi.React.createElement("div", {"class": profilePopout ? "avatarSettingsButtonTooltip avatarSettingsButtonTooltipExperiment" : "avatarSettingsButtonTooltip"}, BdApi.React.createElement(TooltipContainer, {text: tooltips[this.settings.click], position: "top"}, popout));
                        }
                        else return popout;
                    }
                    return avatar;
                }
            });
        }

        onStop() {
            BdApi.clearCSS("AvatarSettingsButton");
            BdApi.Patcher.unpatchAll("AvatarSettingsButton");
        }

        getSettingsPanel() {
            return SettingPanel.build(() => {
                    this.saveSettings();
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
                ], i => {this.settings.contextmenu = i;}),
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