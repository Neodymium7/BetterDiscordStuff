import { DOM, Patcher, Webpack } from "betterdiscord";
import Codeblock from "./components/Codeblock";
import styles from "./styles.css";

const {
	Filters: { byProps },
	getModule,
} = Webpack;

export default class CopyCodeblocks {
	start() {
		DOM.addStyle(styles);
		const Parser = getModule(byProps("parseTopic"));
		Patcher.after(Parser.defaultRules.codeBlock, "react", (_, [{ content }]: [any], ret) => {
			const render = ret.props.children.props.render;
			ret.props.children.props.render = (renderProps) => {
				const codeblock = render(renderProps);
				const innerHTML = codeblock.props.dangerouslySetInnerHTML;
				delete codeblock.props.dangerouslySetInnerHTML;
				codeblock.props.children = <Codeblock content={content} innerHTML={innerHTML} />;
				return codeblock;
			};
		});
	}

	stop() {
		Patcher.unpatchAll();
		DOM.removeStyle();
	}
}
