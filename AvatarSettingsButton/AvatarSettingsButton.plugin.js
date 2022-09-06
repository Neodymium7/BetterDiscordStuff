/**
 * @name AvatarSettingsButton
 * @author Neodymium
 * @version 1.1.5
 * @description Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js
 * @invite fRbsqH87Av
 */

 module.exports = (() => {
    const config = {
        "info": {
            "name": "AvatarSettingsButton",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "1.1.5",
            "description": "Moves the User Settings button to the user avatar, with the status picker and context menu still available on configurable actions",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/AvatarSettingsButton/AvatarSettingsButton.plugin.js"
        },
        "changelog": [
            {"title": "Fixed", "type": "fixed", "items": ["Fixed account details buttons being cut off when the Tooltip setting is enabled"]},
        ]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
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
            const { RadioGroup, SettingPanel, Switch } = Settings;
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
                    BdApi.injectCSS("AvatarSettingsButton", `${settingsSelector} {display: none} .avatarSettingsButtonTooltip {min-width: 120px}`);
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
                                    DiscordModules.UserSettingsWindow.setSection(DiscordModules.DiscordConstants.UserSettingsSections.ACCOUNT);
                                    DiscordModules.UserSettingsWindow.open();
                                    if (document.querySelector("#status-picker") || document.querySelector("#account")) openStatusPicker(e);
                                }
                                const openContextMenu = (e) => {
                                    document.querySelector(settingsSelector).dispatchEvent(new MouseEvent("contextmenu", {bubbles: true, clientX: e.clientX, clientY: (screen.height - 12)}));
                                    if (document.querySelector("#status-picker") || document.querySelector("#account")) openStatusPicker(e);
                                }
                                const actions = [null, openSettings, openContextMenu, openStatusPicker];
                                const tooltips = ["", "User Settings", "Settings Shortcuts", "Set Status"];
                            
                                popout.props.onClick = actions[this.settings.click];
                                popout.props.onContextMenu = actions[this.settings.contextmenu];
                                popout.props.onMouseUp = (e) => {
                                    if (e.button === 1) actions[this.settings.middleclick](e);
                                };
                                if (this.settings.showTooltip && this.settings.click !== 0) {
                                    return BdApi.React.createElement("div", {"class": "avatarSettingsButtonTooltip"}, BdApi.React.createElement(TooltipContainer, {text: tooltips[this.settings.click], position: "top"}, popout));
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
                        new RadioGroup("Click", "What opens when clicking on the user avatar. REMEMBER If nothing is bound to open settings, you can use the Ctrl + , shortcut.", this.settings.click, [
                            {name: "Settings (Default)", value: 1},
                            {name: "Settings Context Menu", value: 2},
                            {name: "Status Picker", value: 3},
                            {name: "Nothing", value: 0}
                        ], i => {this.settings.click = i;}),
                        new RadioGroup("Right Click", "What opens when right clicking on the user avatar.", this.settings.contextmenu, [
                            {name: "Settings", value: 1},
                            {name: "Settings Context Menu", value: 2},
                            {name: "Status Picker (Default)", value: 3},
                            {name: "Nothing", value: 0}
                        ], i => {this.settings.contextmenu = i;}),
                        new RadioGroup("Middle Click", "What opens when middle clicking on the username.", this.settings.middleclick, [
                            {name: "Settings", value: 1},
                            {name: "Settings Context Menu (Default)", value: 2},
                            {name: "Status Picker", value: 3},
                            {name: "Nothing", value: 0}
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