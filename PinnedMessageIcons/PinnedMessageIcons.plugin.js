/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.3
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @invite fRbsqH87Av
 */

const { getModule, Filters: { byStrings } } = BdApi.Webpack;

const Pin = getModule(byStrings("M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096"));

module.exports = class PinnedMessageIcons {
    start() {
        BdApi.injectCSS("PinnedMessageIcons", `
        .pinned-message-icon {
            position: absolute;
            bottom: calc(50% - 10px);
            right: 16px;
            color: var(--interactive-normal);
        }`);
        const Message = getModule((m) => Object.values(m).some(p => p?.toString?.().includes("childrenRepliedMessage")));
        BdApi.Patcher.after("PinnedMessageIcons", Message, "Z", (_, [props], ret) => {
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