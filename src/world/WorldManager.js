/**
 * WorldManager
 *
 * - Khi server khởi động lần đầu: tạo thư mục `world/`, file metadata cho thế giới
 *   và pre-generate một vùng chunk spawn mặc định (khớp với sendChunks hiện tại).
 * - Các lần khởi động sau: chỉ đọc lại metadata và để generateChunk() làm việc như cũ.
 *
 * Lưu ý: format lưu trữ đơn giản (JSON + nhị phân thô cho chunk), không nhằm tương thích
 * trực tiếp với level.dat của Bedrock/PE, chỉ để có persistent world cho GrassServer.
 */

WorldManager = {};

(function initWorld() {
    try {
        // __dirname = .../src/world
        var path = require('path');
        var worldRoot = path.join(__dirname, '..', '..', 'world');

        if (!fs.existsSync(worldRoot)) {
            fs.mkdirSync(worldRoot, { recursive: true });

            // Tạo metadata đơn giản cho thế giới
            var seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
            var level = {
                name: "GrassWorld",
                seed: seed,
                spawn: { x: 0, y: 1, z: 0 },
                createdAt: new Date().toISOString(),
                version: "MCPE 0.12.1-0.12.3",
                generator: "flat_bedrock_3x3"
            };

            fs.writeFileSync(
                path.join(worldRoot, 'level.json'),
                JSON.stringify(level, null, 2),
                'utf8'
            );

            // Pre-generate vùng chunk spawn mặc định (radius = 2, giống sendChunks)
            if (typeof generateChunk === 'function') {
                var radius = 2;
                var totalChunks = (radius * 2 + 1) * (radius * 2 + 1);
                var generated = 0;
                var lastPercent = -1;

                for (var x = -radius; x <= radius; x++) {
                    for (var z = -radius; z <= radius; z++) {
                        try {
                            var chunkData = generateChunk(x, z);
                            var chunkPath = path.join(worldRoot, 'chunk_' + x + '_' + z + '.bin');
                            fs.writeFileSync(chunkPath, chunkData);
                            generated++;

                            var percent = Math.floor(generated * 100 / totalChunks);
                            if (percent !== lastPercent) {
                                lastPercent = percent;
                                console.log(
                                    "WorldManager: generating world " +
                                    percent + "% (" + generated + "/" + totalChunks + " chunks)"
                                );
                            }
                        } catch (e) {
                            console.log("WorldManager: failed to pre-generate chunk (" + x + ", " + z + "): " + e);
                        }
                    }
                }
            }

            WorldManager.info = level;
            WorldManager.path = worldRoot;
            global.WORLD_INFO = level;
            global.WORLD_PATH = worldRoot;

            console.log("WorldManager: created new world at " + worldRoot);
        } else {
            // Load metadata nếu có
            var levelPath = path.join(worldRoot, 'level.json');
            var levelInfo = null;
            if (fs.existsSync(levelPath)) {
                try {
                    levelInfo = JSON.parse(fs.readFileSync(levelPath, 'utf8'));
                } catch (e) {
                    console.log("WorldManager: failed to read level.json, using defaults: " + e);
                }
            }
            if (!levelInfo) {
                levelInfo = {
                    name: "GrassWorld",
                    seed: 0,
                    spawn: { x: 0, y: 1, z: 0 },
                    createdAt: null,
                    version: "MCPE 0.12.1-0.12.3",
                    generator: "flat_bedrock_3x3"
                };
            }

            WorldManager.info = levelInfo;
            WorldManager.path = worldRoot;
            global.WORLD_INFO = levelInfo;
            global.WORLD_PATH = worldRoot;

            console.log("WorldManager: loaded existing world from " + worldRoot);
        }
    } catch (err) {
        console.log("WorldManager: error while initializing world: " + err);
    }
})();

console.log("WorldManager.js loaded");

