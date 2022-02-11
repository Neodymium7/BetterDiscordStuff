/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.0.3
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
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
            "name": "TypingUsersPopouts",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "1.0.3",
            "description": "Opens the user's popout when clicking on a name in the typing area.",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js"
        },
        "main": "index.js"};

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

    const { DiscordModules, DiscordSelectors, Patcher, Popouts, ReactComponents } = Library;
    
    const nameSelector = `${DiscordSelectors.Typing.typing} > span > strong`;
    const popoutSelector = DiscordSelectors.UserPopout.userPopout;
    const rolePopoutSelector = ".container-2O1UgZ";
    const tooltipSelector = DiscordSelectors.Tooltips.tooltip;
    const avatarSelector = ".avatarWrapper-eenWra";

    function remove(e) { // Quick fix for popout not closing when it should
        const isInPopout = document.querySelector("#ZeresPluginLibraryPopouts").contains(e.target);
        const isName = Array.from(document.querySelectorAll(nameSelector)).some(node => node.isEqualNode(e.target));

        if (!isInPopout && !isName) {
            document.querySelector(popoutSelector)?.remove();
            document.querySelector(rolePopoutSelector)?.remove();
            document.querySelector(tooltipSelector)?.remove();
        }
        else if (document.querySelector(avatarSelector).contains(e.target) && e.button === 0) {
            document.querySelector(avatarSelector).click();
            document.querySelector(popoutSelector).remove();
            document.querySelector(rolePopoutSelector)?.remove();
            document.querySelector(tooltipSelector)?.remove();
        }
        else if (!isName) {
            document.addEventListener("mouseup", remove, {once: true});
        }
    }

    return class TypingUsersPopouts extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            this.patch();
            BdApi.injectCSS("TypingUsersPopouts", `${nameSelector}{cursor: pointer;} ${nameSelector}:hover{text-decoration: underline;}`);
        }

        onStop() {
            Patcher.unpatchAll();
            BdApi.clearCSS("TypingUsersPopouts");
        }
        
        async patch() {
            const TypingUsers = await ReactComponents.getComponentByName("TypingUsers", DiscordSelectors.Typing.typing);
            Patcher.after(TypingUsers.component.prototype, 'render', (component, [props], ret) => {
                if(ret.props.children && Array.isArray(ret.props.children[1].props.children)) {
                    const typingUsers = Object.keys(component.props.typingUsers).filter(id => id !== DiscordModules.UserStore.getCurrentUser().id && !DiscordModules.RelationshipStore.isBlocked(id));
                    const names = ret.props.children[1].props.children.filter(child => child.type === "strong");
                    for (let i = 0; i < typingUsers.length; i++) {
                        names[i].props.className = `typing-user-${typingUsers[i]}`;
                        names[i].props.onClick = e => {
                            if (!document.querySelector(`${popoutSelector}[data-user-id="${typingUsers[i]}"]`)) {
                                document.querySelector(popoutSelector)?.remove();
                                e.stopPropagation();
                                BdApi.findModuleByProps("fetchProfile").fetchProfile(typingUsers[i]);
                                Popouts.showUserPopout(document.querySelector(`.typing-user-${typingUsers[i]}`), DiscordModules.UserStore.getUser(typingUsers[i])/* , {position: "top"} */);
                                document.addEventListener("mouseup", remove, {once: true}); // Quick fix for popout not closing when it should
                            }
                        }
                    }
                }
            });
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/