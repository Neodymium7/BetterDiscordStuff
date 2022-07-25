#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ignore = [];

let updatedFiles = process.argv.slice(2);

const updatedSubDirs = [
	...new Set(
		updatedFiles.map(filePath => {
			const split = filePath.split(path.sep);
			if (split.length === 1) return split[0];
			return split[0] + path.sep + split[1];
		})
	)
];

const updatedDirs = [...new Set(updatedSubDirs.map(dirPath => dirPath.split(path.sep)[0]))];

const updatedPlugins = updatedDirs.filter(dirName => {
	const srcPath = path.join(dirName, "src");
	return (
		updatedSubDirs.includes(srcPath) &&
		!ignore.includes(dirName) &&
		fs.lstatSync(srcPath).isDirectory() &&
		fs.existsSync(path.resolve(srcPath, "config.json"))
	);
});

if (updatedPlugins.length === 0) {
	console.log("No updated plugins found");
	execSync('echo "::set-output name=built::false"', { stdio: "inherit" });
	process.exit(0);
}

console.log(`Found ${updatedPlugins.length} updated plugins`);

for (let i = 0; i < updatedPlugins.length; i++) {
	console.log(`Building plugin: ${updatedPlugins[i]}`);
	execSync(`npm run build "${updatedPlugins[i]}"`, { stdio: "inherit" });
}

console.log("All plugins built");

let message = "Build plugins: " + updatedPlugins.map(plugin => {
    const version = JSON.parse(fs.readFileSync(path.resolve(plugin, "src", "config.json"), "utf8")).meta?.version;
    if (version) return `${plugin} v${version}`;
    return plugin;
}).join(", ");

if (message.length > 72) message = "Build plugins";

execSync('echo "::set-output name=built::true"', { stdio: "inherit" });
execSync(`echo "::set-output name=message::${message}"`, { stdio: "inherit" });
