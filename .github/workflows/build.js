#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const findVersion = (pluginContents) => {
	const lines = pluginContents.split("\n");
	const versionLine = lines.find((line) => line.includes("@version"));
	return versionLine.split(/\s+/).pop();
};

const ignore = [];

let updatedPlugins = process.argv.slice(2);

if (updatedPlugins.length === 0) {
	const updatedFiles = execSync("git diff HEAD^ HEAD --name-only").toString().split("\n");
	const updatedDirs = [...new Set(updatedFiles.map((filePath) => filePath.split(path.sep)[0]))];

	updatedPlugins = updatedDirs.filter((dirName) => {
		const srcPath = path.join(dirName, "src");

		const ignored = ignore.includes(dirName);
		const deprecated = dirName.includes("DEPRECATED");
		const isValidPlugin =
			fs.existsSync(srcPath) &&
			fs.lstatSync(srcPath).isDirectory() &&
			fs.existsSync(path.resolve(srcPath, "manifest.json"));
		if (ignored || deprecated || !isValidPlugin) return false;

		const prevPluginPath = path.join(dirName, dirName + ".plugin.js");

		const updatedVersion = JSON.parse(fs.readFileSync(path.resolve(srcPath, "manifest.json"), "utf8"))?.version;
		const prevVersion = fs.existsSync(prevPluginPath)
			? findVersion(fs.readFileSync(prevPluginPath, "utf-8"))
			: "none";

		return updatedVersion !== prevVersion;
	});
}

if (updatedPlugins.length === 0) {
	console.log("No updated plugins found");
	execSync('echo "built=false" >> $GITHUB_OUTPUT', { stdio: "inherit" });
	process.exit(0);
}

console.log(`Found ${updatedPlugins.length} updated plugins`);

for (let i = 0; i < updatedPlugins.length; i++) {
	console.log(`Building plugin: ${updatedPlugins[i]}`);
	execSync(`npm run build "${updatedPlugins[i]}"`, { stdio: "inherit" });
}

console.log("All plugins built");

let message =
	"Build plugins: " +
	updatedPlugins
		.map((plugin) => {
			const version = JSON.parse(fs.readFileSync(path.resolve(plugin, "src", "manifest.json"), "utf8"))?.version;
			if (version) return `${plugin} v${version}`;
			return plugin;
		})
		.join(", ");

if (message.length > 72) message = "Build plugins";

execSync('echo "built=true" >> $GITHUB_OUTPUT', { stdio: "inherit" });
execSync(`echo "message=${message}" >> $GITHUB_OUTPUT`, { stdio: "inherit" });
