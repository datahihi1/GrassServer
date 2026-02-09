console.log("Starting GrassServer - Minecraft PE Server Version 0.12.1_0.12.3");
require("./loader.js").then(() => {
	SocketInstance = new SocketHandler(19132);
}).catch(err => {
	console.error('Failed to load modules:', err);
	process.exit(1);
});
