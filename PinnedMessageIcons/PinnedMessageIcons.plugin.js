/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.2
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @invite fRbsqH87Av
 */

const Pin = BdApi.findModuleByDisplayName("Pin");

module.exports = class PinnedMessageIcons {
    start() {
        BdApi.injectCSS("PinnedMessageIcons", `
        .pinned-message-icon {
            position: absolute;
            bottom: calc(50% - 10px);
            right: 16px;
            color: var(--interactive-normal);
        }`);
        const Message = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes("childrenRepliedMessage"));
        BdApi.Patcher.after("PinnedMessageIcons", Message, "default", (_, [props], ret) => {
            const isPinned = props.childrenMessageContent.props.message.pinned;
            if (isPinned && Array.isArray(ret.props.children.props.children) && !props["data-list-item-id"].includes("pin")) {
                ret.props.children.props.className += " pinned-message";
                ret.props.children.props.children.push(BdApi.React.createElement(Pin, {"class": "pinned-message-icon", width: "20px", height: "20px"}));
            }
        });
    }

    stop() {
        BdApi.Patcher.unpatchAll("PinnedMessageIcons");
        BdApi.clearCSS("PinnedMessageIcons");
    }
}