/**
 * @name CopyCodeblocks
 * @author Neodymium
 * @description Adds a simple copy button to codeblocks.
 * @version 1.1.0
 * @source https://github.com/Neodymium7/BetterDiscordStuff/blob/main/CopyCodeblocks/CopyCodeblocks.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Neodymium7/BetterDiscordStuff/main/CopyCodeblocks/CopyCodeblocks.plugin.js
 * @invite fRbsqH87Av
 */
(() => {
	"use strict";
	var __webpack_modules__ = {
		617: (module, __webpack_exports__, __webpack_require__) => {
			__webpack_require__.d(__webpack_exports__, {
				Z: () => __WEBPACK_DEFAULT_EXPORT__
			});
			var styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(703);
			var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(882);
			var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
			var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(268);
			var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
			var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default());
			___CSS_LOADER_EXPORT___.push([module.id, ".codeblockWrapper {\n\tposition: relative;\n\tmargin: -7px;\n}\n.codeblockContent {\n\tpadding: 7px;\n}\n.copyCodeblockButton {\n\tposition: absolute;\n\tright: 3px;\n\ttop: 3px;\n\theight: 18px;\n\twidth: 18px;\n\tpadding: 2px;\n\tbackground-color: var(--background-tertiary);\n\tcolor: var(--interactive-normal);\n\tbox-shadow: var(--elevation-medium);\n\tborder: 1px solid var(--background-floating);\n\tborder-radius: 4px;\n\tcursor: pointer;\n\topacity: 1;\n\ttransition: opacity 0.1s, transform 0.1s;\n\ttransform: none;\n}\n.copyCodeblockButton:hover {\n\tcolor: var(--interactive-hover);\n}\n.copyCodeblockButton:active {\n\tcolor: var(--interactive-active);\n}\n.codeblockWrapper:not(:hover) .copyCodeblockButton {\n\topacity: 0;\n\ttransform: scale(0.95) translate(2px, -2px);\n}\n", ""]);
			(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("styles.css", ___CSS_LOADER_EXPORT___.toString());
			const __WEBPACK_DEFAULT_EXPORT__ = ___CSS_LOADER_EXPORT___.toString()
		},
		703: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
			__webpack_require__.d(__webpack_exports__, {
				z: () => load
			});
			let _styles = "";

			function load(path, css) {
				_styles += `/* ${path} */\n${css}\n`
			}

			function styles() {
				return _styles
			}
		},
		268: module => {
			module.exports = function(cssWithMappingToString) {
				var list = [];
				list.toString = function toString() {
					return this.map((function(item) {
						var content = "";
						var needLayer = "undefined" !== typeof item[5];
						if (item[4]) content += "@supports (".concat(item[4], ") {");
						if (item[2]) content += "@media ".concat(item[2], " {");
						if (needLayer) content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
						content += cssWithMappingToString(item);
						if (needLayer) content += "}";
						if (item[2]) content += "}";
						if (item[4]) content += "}";
						return content
					})).join("")
				};
				list.i = function i(modules, media, dedupe, supports, layer) {
					if ("string" === typeof modules) modules = [
						[null, modules, void 0]
					];
					var alreadyImportedModules = {};
					if (dedupe)
						for (var k = 0; k < this.length; k++) {
							var id = this[k][0];
							if (null != id) alreadyImportedModules[id] = true
						}
					for (var _k = 0; _k < modules.length; _k++) {
						var item = [].concat(modules[_k]);
						if (dedupe && alreadyImportedModules[item[0]]) continue;
						if ("undefined" !== typeof layer)
							if ("undefined" === typeof item[5]) item[5] = layer;
							else {
								item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
								item[5] = layer
							} if (media)
							if (!item[2]) item[2] = media;
							else {
								item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
								item[2] = media
							} if (supports)
							if (!item[4]) item[4] = "".concat(supports);
							else {
								item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
								item[4] = supports
							} list.push(item)
					}
				};
				return list
			}
		},
		882: module => {
			module.exports = function(i) {
				return i[1]
			}
		},
		113: module => {
			module.exports = BdApi.React
		}
	};
	var __webpack_module_cache__ = {};

	function __webpack_require__(moduleId) {
		var cachedModule = __webpack_module_cache__[moduleId];
		if (void 0 !== cachedModule) return cachedModule.exports;
		var module = __webpack_module_cache__[moduleId] = {
			id: moduleId,
			exports: {}
		};
		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
		return module.exports
	}(() => {
		__webpack_require__.n = module => {
			var getter = module && module.__esModule ? () => module["default"] : () => module;
			__webpack_require__.d(getter, {
				a: getter
			});
			return getter
		}
	})();
	(() => {
		__webpack_require__.d = (exports, definition) => {
			for (var key in definition)
				if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
					enumerable: true,
					get: definition[key]
				})
		}
	})();
	(() => {
		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
	})();
	var __webpack_exports__ = {};
	(() => {
		__webpack_require__.d(__webpack_exports__, {
			default: () => CopyCodeblocks
		});
		const external_BdApi_namespaceObject = BdApi;
		var external_BdApi_React_ = __webpack_require__(113);
		var React = __webpack_require__(113);
		const SvgCopy = props => React.createElement("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 24 24",
			...props
		}, React.createElement("path", {
			d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z",
			fill: "currentColor"
		}), React.createElement("path", {
			d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z",
			fill: "currentColor"
		}));
		const copy = SvgCopy;
		var Codeblock_React = __webpack_require__(113);
		const {
			Filters: {
				byProps,
				byPrototypeFields
			},
			getModule
		} = external_BdApi_namespaceObject.Webpack;
		const Tooltip = getModule(byPrototypeFields("renderTooltip"));
		const {
			copy: Codeblock_copy
		} = getModule(byProps("requireModule"));

		function Codeblock(props) {
			const [copied, setCopied] = (0, external_BdApi_React_.useState)(false);
			const [forceOpen, setForceOpen] = (0, external_BdApi_React_.useState)(false);
			const resetCopied = () => {
				setForceOpen(false);
				setTimeout((() => setCopied(false)), 50)
			};
			const copyCode = () => {
				Codeblock_copy(props.content);
				setCopied(true);
				setForceOpen(true);
				setTimeout(resetCopied, 1500)
			};
			return Codeblock_React.createElement("div", {
				className: "codeblockWrapper",
				onMouseLeave: resetCopied
			}, Codeblock_React.createElement(Tooltip, {
				position: "top",
				text: copied ? "Copied!" : "Copy Code",
				color: copied ? "green" : "primary",
				forceOpen
			}, (props2 => Codeblock_React.createElement("div", {
				...props2,
				className: "copyCodeblockButton",
				onClick: copyCode
			}, Codeblock_React.createElement(copy, {
				width: "18",
				height: "18"
			})))), Codeblock_React.createElement("div", {
				className: "codeblockContent",
				dangerouslySetInnerHTML: props.innerHTML || void 0
			}, props.innerHTML ? void 0 : props.content))
		}
		var styles = __webpack_require__(617);
		var src_React = __webpack_require__(113);
		const {
			Filters: {
				byProps: src_byProps
			},
			getModule: src_getModule
		} = external_BdApi_namespaceObject.Webpack;
		class CopyCodeblocks {
			start() {
				(0, external_BdApi_namespaceObject.injectCSS)("CopyCodeblocks", styles.Z);
				const Parser = src_getModule(src_byProps("parseTopic"));
				external_BdApi_namespaceObject.Patcher.after("CopyCodeblocks", Parser.defaultRules.codeBlock, "react", ((_, [{
					content
				}], ret) => {
					const render = ret.props.render;
					ret.props.render = renderProps => {
						const codeblock = render(renderProps);
						const innerHTML = codeblock.props.children.props.dangerouslySetInnerHTML;
						delete codeblock.props.children.props.dangerouslySetInnerHTML;
						codeblock.props.children.props.children = src_React.createElement(Codeblock, {
							content,
							innerHTML
						});
						return codeblock
					}
				}))
			}
			stop() {
				external_BdApi_namespaceObject.Patcher.unpatchAll("CopyCodeblocks");
				(0, external_BdApi_namespaceObject.clearCSS)("CopyCodeblocks")
			}
		}
	})();
	module.exports = __webpack_exports__["default"]
})();