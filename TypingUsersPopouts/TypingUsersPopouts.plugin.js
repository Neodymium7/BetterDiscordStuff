/**
 * @name TypingUsersPopouts
 * @author Neodymium
 * @version 1.1.2
 * @description Opens the user's popout when clicking on a name in the typing area.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js
 * @invite fRbsqH87Av
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "TypingUsersPopouts",
            "authors": [
                {
                    "name": "Neodymium"
                }
            ],
            "version": "1.1.2",
            "description": "Opens the user's popout when clicking on a name in the typing area.",
            "github": "https://github.com/Neodymium7/BetterDiscordStuff/blob/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/TypingUsersPopouts/TypingUsersPopouts.plugin.js"
        },
        "changelog": [
            {"title": "Fixed", "type": "fixed", "items": ["Fixed plugin after Discord's changes to the typing area", "Should also be more resilient to future changes"]},
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

            const { DiscordModules, DiscordSelectors, Patcher, Popouts, ReactComponents, Utilities } = Library;

            const fetchProfile = BdApi.findModuleByProps("fetchProfile").fetchProfile;
            const getUserProfile = BdApi.findModuleByProps("getUserProfile").getUserProfile;

            const LoadingPopout = BdApi.findModuleByDisplayName("LoadingPopout");

            const nameSelector = `${DiscordSelectors.Typing.typing} strong`;
            const avatarSelector = `${DiscordSelectors.UserPopout.userPopout} > :nth-child(2)`;

            let currentPopoutId;

            function remove(e) { // Quick fix for popout not closing when it should
                const inPopout = document.querySelector("#ZeresPluginLibraryPopouts").contains(e.target);
                const isName = Array.from(document.querySelectorAll(nameSelector)).some(node => node.isEqualNode(e.target));
            
                if (!inPopout && !isName) Popouts.closePopout(currentPopoutId);
                else if (document.querySelector(avatarSelector).contains(e.target) && e.button === 0) {
                    document.querySelector(avatarSelector).click();
                    Popouts.closePopout(currentPopoutId);
                }
                else if (!isName) document.addEventListener("mouseup", remove, {once: true});
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
                        const typingUsers = Object.keys(component.props.typingUsers).filter(id => id !== DiscordModules.UserStore.getCurrentUser().id && !DiscordModules.RelationshipStore.isBlocked(id));
                        const names = Utilities.findInTree(ret, e => Array.isArray(e) && e.length > 0 && e[0].type === "strong")?.filter(child => child.type === "strong");
                        if (!names) return;
                        for (let i = 0; i < typingUsers.length; i++) {
                            names[i].props.className = `typing-user-${typingUsers[i]}`;
                            names[i].props.onClick = async e => {
                                if (document.querySelector(`#ZeresPluginLibraryPopouts ${DiscordSelectors.UserPopout.userPopout}[data-user-id="${typingUsers[i]}"]`)) return;
                                const name = document.querySelector(`.typing-user-${typingUsers[i]}`);
                                e.stopPropagation();
                                if (currentPopoutId) await Popouts.closePopout(currentPopoutId);
                                if (!getUserProfile(typingUsers[i])) {
                                    const loadingId = Popouts.openPopout(name, {position: "top", align: "left", spacing: 8, render: () => BdApi.React.createElement(LoadingPopout)});
                                    await fetchProfile(typingUsers[i]);
                                    Popouts.closePopout(loadingId);
                                }
                                currentPopoutId = Popouts.openPopout(name, {position: "top", align: "left", nudgeAlignIntoViewport: true, spacing: 8, animation: Popouts.AnimationTypes.TRANSLATE, render: () => BdApi.React.createElement(DiscordModules.UserPopout, {userId: typingUsers[i], guildId: DiscordModules.SelectedGuildStore.getGuildId(), channelId: DiscordModules.SelectedChannelStore.getChannelId()})});
                                document.addEventListener("mouseup", remove, {once: true}); // Quick fix for popout not closing when it should
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