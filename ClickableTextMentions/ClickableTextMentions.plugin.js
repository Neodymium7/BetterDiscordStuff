/**
 * @name ClickableTextMentions
 * @author Neodymium
 * @version 1.0.0
 * @description Makes mentions in the message text area clickable.
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/ClickableTextMentions/ClickableTextMentions.plugin.js
 * @invite fRbsqH87Av
 */

/*@cc_on
@if (@_jscript)

	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
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

'use strict';

const betterdiscord = new BdApi("ClickableTextMentions");

// @lib/utils/webpack.ts
const {
	getModule,
	Filters: { byStrings: byStrings$2, byKeys: byKeys$1 }
} = betterdiscord.Webpack;
function expect(object, options) {
	if (object) return object;
	const fallbackMessage = !options.fatal && options.fallback ? " Using fallback value instead." : "";
	const errorMessage = `Module ${options.name} not found.${fallbackMessage}

Contact the plugin developer to inform them of this error.`;
	betterdiscord.Logger.error(errorMessage);
	options.onError?.();
	if (options.fatal) throw new Error(errorMessage);
	return options.fallback;
}
function expectModule(options) {
	return expect(getModule(options.filter, options), options);
}

// modules.tsx
const {
	Filters: { byStrings: byStrings$1, byKeys }
} = betterdiscord.Webpack;
const ErrorPopout = (props) => BdApi.React.createElement("div", { style: { backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" } }, props.message);
const UserPopout = expectModule({
	filter: (m) => m.toString?.().includes("UserProfilePopoutWrapper"),
	name: "UserPopout",
	fallback: (_props) => BdApi.React.createElement(ErrorPopout, { message: "Error: User Popout module not found" })
});
const Popout = expectModule({
	filter: byKeys("Popout"),
	name: "Common",
	fallback: {
		Popout: (props) => props.children()
	}
}).Popout;
const loadProfile = expectModule({
	filter: byStrings$1("preloadUserBanner"),
	name: "loadProfile"
});
const UserStore = betterdiscord.Webpack.getStore("UserStore");

// index.tsx
const {
	getWithKey,
	Filters: { byStrings }
} = betterdiscord.Webpack;
const [Module, key] = getWithKey(byStrings(".hidePersonalInformation", "#", "<@", ".discriminator"));
if (!Module) betterdiscord.Logger.error("Text area mention module not found.");
const onClick = (e) => {
	e.preventDefault();
};
class ClickableTextMentions {
	start() {
		if (!Module) return;
		betterdiscord.Patcher.after(Module, key, (_, [props], ret) => {
			const { guildId, channelId } = props;
			const user = UserStore.getUser(props.id);
			const original = ret.props.children;
			ret.props.children = (childrenProps) => {
				const childrenRet = original(childrenProps);
				const mention = childrenRet.props.children;
				const text = mention.props.children;
				mention.props.onClick = onClick;
				mention.props.children = BdApi.React.createElement(
					Popout,
					{
						align: "left",
						position: "top",
						key: user.id,
						renderPopout: () => BdApi.React.createElement(UserPopout, { userId: user.id, guildId, channelId }),
						preload: () => loadProfile(user.id, user.getAvatarURL(guildId, 80), { guildId, channelId })
					},
					(props2) => BdApi.React.createElement("span", { ...props2 }, text)
				);
				return BdApi.React.createElement(BdApi.React.Fragment, null, mention);
			};
		});
	}
	stop() {
		betterdiscord.Patcher.unpatchAll();
	}
}

module.exports = ClickableTextMentions;

/*@end@*/