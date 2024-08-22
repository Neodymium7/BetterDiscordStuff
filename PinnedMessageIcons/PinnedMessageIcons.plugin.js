/**
 * @name PinnedMessageIcons
 * @author Neodymium
 * @version 1.0.5
 * @description Displays an icon on and adds a class to pinned messages. (Heavily inspired by PinIcon by Qwerasd, go check out their plugin!)
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/PinnedMessageIcons/PinnedMessageIcons.plugin.js
 * @invite fRbsqH87Av
 */

const { DOM, Patcher, Webpack } = new BdApi("PinnedMessageIcons");
const { getModule, Filters } = Webpack;

const pinPath = "M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5"

const Pin = getModule(Filters.byStrings(pinPath), { searchExports: true });

const Message = getModule((m) => m.Z?.toString?.().includes("childrenRepliedMessage"));

module.exports = class PinnedMessageIcons {
    start() {
        DOM.addStyle(`
        .pinned-message-icon {
            position: absolute;
            bottom: calc(50% - 10px);
            right: 16px;
        }`);

		Patcher.after(Message, "Z", (_, [props], ret) => {
            if (!props.childrenMessageContent.props.message) return ret;

            const isPinned = props.childrenMessageContent.props.message.pinned;
            if (isPinned && Array.isArray(ret.props.children.props.children) && !props["data-list-item-id"].includes("pin")) {
                ret.props.children.props.className += " pinned-message";
                ret.props.children.props.children.push(BdApi.React.createElement(Pin, {
                    className: "pinned-message-icon", 
                    color: "var(--interactive-normal)", 
                    size: "20px", 
                    width: "20px", 
                    height: "20px" 
                }));
            }
        });
    }

    stop() {
        Patcher.unpatchAll();
        DOM.removeStyle();
    }
}