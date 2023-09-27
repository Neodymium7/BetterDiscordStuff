/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.6
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @invite fRbsqH87Av
 */

const { DOM, Patcher, Webpack } = new BdApi("PinnedMessageIcons");
const { getModule, modules } = Webpack;

const Pin = getModule((_e, _m, i) => modules[i].toString().includes("M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096")).Z;

module.exports = class PinnedMessageIcons {
    start() {
        DOM.addStyle(`
        .pinned-message-icon {
            position: absolute;
            bottom: calc(50% - 10px);
            right: 16px;
            color: var(--interactive-normal);
        }`);

        const Message = getModule((m) => Object.values(m).some(p => p?.toString?.().includes('"childrenRepliedMessage"')));
		Patcher.after(Message, "Z", (_, [props], ret) => {
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