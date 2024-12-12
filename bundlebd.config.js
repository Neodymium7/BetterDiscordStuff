const { defineConfig } = require("bundlebd");

module.exports = defineConfig((plugin, dev) => ({
	input: `${plugin}/src`,
	output: dev ? `${plugin}/dist` : `${plugin}`,
	importAliases: {
		"@lib/*": `lib/*`,
	},
}));
