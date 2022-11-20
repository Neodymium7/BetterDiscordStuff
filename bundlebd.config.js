module.exports = (plugin, dev) => ({
	input: `${plugin}/src`,
	output: dev ? `${plugin}/dist` : `${plugin}`
});
