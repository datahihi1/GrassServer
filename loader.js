console.log("Loading modules...");
fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { pathToFileURL } = require('url');
ByteBuffer = require('bytebuffer');
dgram = require("dgram");
ByteBuffer.DEFAULT_NOASSERT = true;

async function walk(dir) {
    const list = await fsp.readdir(dir);
    for (const name of list) {
        const file = path.join(dir, name);
        const stat = await fsp.stat(file);
        if (stat && stat.isDirectory()) {
            await walk(file);
        } else {
            await import(pathToFileURL(file).href);
        }
    }
}

module.exports = (async () => {
    try {
        await walk(path.join(__dirname, 'src'));
    } catch (err) {
        console.error('Error loading modules:', err);
        throw err;
    }
})();