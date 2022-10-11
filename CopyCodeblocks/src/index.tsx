import { clearCSS, injectCSS, Patcher, Webpack } from "betterdiscord";
import Codeblock from "./components/Codeblock";
import styles from "./styles.css";

const {
	Filters: { byProps },
	getModule
} = Webpack;

export default class CopyCodeblocks {
	start() {
		injectCSS("CopyCodeblocks", styles);
		const Parser = getModule(byProps("parseTopic"));
		Patcher.after("CopyCodeblocks", Parser.defaultRules.codeBlock, "react", (_, [{ content }], ret) => {
			const render = ret.props.render;
			ret.props.render = (renderProps) => {
				const codeblock = render(renderProps);
				const innerHTML = codeblock.props.children.props.dangerouslySetInnerHTML;
				delete codeblock.props.children.props.dangerouslySetInnerHTML;
				codeblock.props.children.props.children = <Codeblock content={content} innerHTML={innerHTML} />;
				return codeblock;
			};
		});
	}

	stop() {
		Patcher.unpatchAll("CopyCodeblocks");
		clearCSS("CopyCodeblocks");
	}
}
