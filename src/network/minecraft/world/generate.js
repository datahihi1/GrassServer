var BLOCK_AIR = 0;
var BLOCK_BEDROCK = 7;

/**
 * Tạo dữ liệu chunk cho MCPE 0.12: 1 subchunk 16x16x16.
 * Định dạng: 4096 bytes block ID + 2048 bytes block data (nibbles).
 * Bedrock 3x3x1 ở tâm đáy chunk (x=7,8,9 z=7,8,9 y=0).
 */
function buildSubChunkData() {
    var blockIds = Buffer.allocUnsafe(4096);
    var blockData = Buffer.allocUnsafe(2048);
    blockIds.fill(0);
    blockData.fill(0);
    var bedrockCoords = [
        [7,0,7],[8,0,7],[9,0,7],
        [7,0,8],[8,0,8],[9,0,8],
        [7,0,9],[8,0,9],[9,0,9]
    ];
    for (var i = 0; i < bedrockCoords.length; i++) {
        var x = bedrockCoords[i][0], y = bedrockCoords[i][1], z = bedrockCoords[i][2];
        var idx = y * 256 + z * 16 + x;
        blockIds[idx] = BLOCK_BEDROCK;
        var nibbleIdx = idx >> 1;
        if ((idx & 1) === 0) {
            blockData[nibbleIdx] = (blockData[nibbleIdx] & 0x0f) | (0 << 4);
        } else {
            blockData[nibbleIdx] = (blockData[nibbleIdx] & 0xf0) | 0;
        }
    }
    return Buffer.concat([blockIds, blockData]);
}

/**
 * Tạo chunk data cho LevelChunkPacket (1 subchunk với bedrock 3x3x1).
 * Trả về raw subchunk 6144 bytes (4096 block IDs + 2048 block data).
 */
function generateChunk(chunkX, chunkZ) {
    return buildSubChunkData();
}

if (typeof global !== 'undefined') global.generateChunk = generateChunk;
console.log("generate.js - World Generator loaded");