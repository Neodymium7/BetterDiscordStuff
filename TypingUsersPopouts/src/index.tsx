import { DOM, Patcher, Utils, Meta, Plugin, Changes, Webpack, WithKeyResult, Logger } from "betterdiscord";
import { showChangelog } from "@lib";
import { changelog } from "./manifest.json";
import { RelationshipStore, TypingStore, UserStore } from "@discord/stores";
import { UserPopoutWrapper } from "@lib/components";
import { expectSelectors, waitForModuleWithKey } from "@lib/utils/webpack";
import { AnyComponent } from "@lib/utils/react";

export default class TypingUsersPopouts implements Plugin {
	meta: Meta;
	modules: {
		TypingUsersContainer: WithKeyResult<AnyComponent>;
		typingSelector: string | undefined;
	} = {} as any;
	modulesLoaded = false;

	constructor(meta: Meta) {
		this.meta = meta;
	}

	async start() {
		showChangelog(changelog as Changes[], this.meta);

		await this.getModules();
		DOM.addStyle(
			`${this.modules.typingSelector} strong { cursor: pointer; } ${this.modules.typingSelector} strong:hover { text-decoration: underline; }`
		);
		this.patch();
	}

	async getModules() {
		if (this.modulesLoaded) return;

		this.modules.TypingUsersContainer = [
			...(await waitForModuleWithKey<AnyComponent>(Webpack.Filters.byStrings("typingUsers:"))),
		];

		const [module] = this.modules.TypingUsersContainer;
		if (!module) Logger.error("TypingUsersContainer module not found");

		this.modules.typingSelector = expectSelectors("Typing Class", ["typingDots", "typing"])?.typing;

		this.modulesLoaded = true;
	}

	patch() {
		if (!this.modules.TypingUsersContainer) return;
		const patchType = (props: any, ret: any) => {
			const text = Utils.findInTree(ret, (e) => Array.isArray(e?.children) && e.children[0]?.type === "strong", {
				walkable: ["props", "children"],
			});
			if (!text) return;

			const channel = props.channel;
			const guildId = channel.guild_id;

			const typingUsersIds = Object.keys(TypingStore.getTypingUsers(channel.id)).filter(
				(id) =>
					id !== UserStore.getCurrentUser().id &&
					!RelationshipStore.isBlocked(id) &&
					!RelationshipStore.isIgnored(id)
			);

			let i = 0;
			text.children = text.children.map((e: React.ReactElement) => {
				if (e.type !== "strong") return e;

				const user = UserStore.getUser(typingUsersIds[i++]);

				return (
					<UserPopoutWrapper id={user.id} guildId={guildId} channelId={channel.id}>
						{e}
					</UserPopoutWrapper>
				);
			});
		};

		let patchedType: ((props: any) => React.ReactNode) | undefined;

		Patcher.after(...this.modules.TypingUsersContainer, (_, __, containerRet) => {
			if (patchedType) {
				containerRet.type = patchedType;
				return containerRet;
			}

			const original = containerRet.type as React.FunctionComponent<any>;

			patchedType = (props) => {
				const ret = original(props);
				patchType(props, ret);
				return ret;
			};

			containerRet.type = patchedType;
		});
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
