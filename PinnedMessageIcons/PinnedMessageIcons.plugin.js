/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.4
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @invite fRbsqH87Av
 */

const { DOM, Patcher, Webpack } = new BdApi("PinnedMessageIcons");
const { getModule } = Webpack;

const pinPath = "M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096"

const Pin = getModule((e, _m, i) => {
    const moduleSource = Webpack.modules[i].toString();
    return moduleSource.includes(pinPath) && typeof e === "function"
});

const Message = getModule((m) => m.default?.toString?.().includes("childrenRepliedMessage"));

module.exports = class PinnedMessageIcons {
    start() {
        DOM.addStyle(`
        .pinned-message-icon {
            position: absolute;
            bottom: calc(50% - 10px);
            right: 16px;
            color: var(--interactive-normal);
        }`);

		Patcher.after(Message, "default", (_, [props], ret) => {
            if (!props.childrenMessageContent.props.message) return ret;

            const isPinned = props.childrenMessageContent.props.message.pinned;
            if (isPinned && Array.isArray(ret.props.children.props.children) && !props["data-list-item-id"].includes("pin")) {
                ret.props.children.props.className += " pinned-message";
                ret.props.children.props.children.push(BdApi.React.createElement(Pin, { className: "pinned-message-icon", width: "20px", height: "20px" }));
            }
        });
    }

    stop() {
        Patcher.unpatchAll();
        DOM.removeStyle();
    }
}