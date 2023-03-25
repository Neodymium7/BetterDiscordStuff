import { DOM, Patcher, Webpack } from "betterdiscord";
import { WebpackUtils } from "bundlebd";
import Codeblock from "./components/Codeblock";
import styles from "./styles.css";

const {
	Filters: { byProps },
} = Webpack;

const { expectModule } = WebpackUtils;

const Parser: any = expectModule(byProps("parseTopic"), { name: "Parser" });

export default class CopyCodeblocks {
	start() {
		DOM.addStyle(styles);

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
