/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.0
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
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
            "name": "PinnedMessageIcons",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "1.0.0",
            "description": "Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js"
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

    const { Tooltip } = Library;

    const messageSelector = ".message-2CShn3";

    return class PinnedMessageIcons extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            const Message = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes('childrenRepliedMessage'));
            BdApi.Patcher.after("PinnedMessageIcons", Message, "default", (_, [props], ret) => {
                setTimeout(() => {
                    const isPinned = props.childrenMessageContent.props.message.pinned;
                    const id = props.childrenMessageContent.props.message.id;
                    const node = document.querySelector(messageSelector + "[data-list-item-id='chat-messages___chat-messages-" + id + "']");
                    if (isPinned && node && !node.classList.contains("pinned-message")) {
                        node.classList.add("pinned-message");
                        const icon = document.createElement("div");
                            icon.classList.add("pinned-message-icon");
                            icon.style = "position: absolute; width: 16px; height: 16px; bottom: calc(50% - 8px); right: 16px; background-position-x: -1px; background-image: url(\"/assets/1f57f1c100434d1ff6569a495ada213e.svg\");";
                        node.appendChild(icon);
                        new Tooltip(icon, "Pinned");
                    }
                    if (!isPinned && node && node.classList.contains("pinned-message")) {
                        node.classList.remove("pinned-message");
                        node.querySelector(".pinned-message-icon").remove();
                    }
                }, 0); 
            });
        }

        onStop() {
            BdApi.Patcher.unpatchAll("PinnedMessageIcons");
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/