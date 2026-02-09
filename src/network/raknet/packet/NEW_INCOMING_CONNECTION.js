/**
 * RakNet "New Incoming Connection" (ID 0x13).
 *
 * Cấu trúc theo https://minecraft.wiki/w/RakNet:
 * - 0x13
 * - Server address (address)
 * - Internal address (20x address)
 * - Incoming timestamp (Long)
 * - Server timestamp (Long)
 */

NEW_INCOMING_CONNECTION = function(buf){
    if (buf && buf.buffer !== undefined) {
        this.bb = buf;
        this.bb.offset = 1;
    } else {
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = 0x13;
        this.bb.offset = 1;
    }
};

NEW_INCOMING_CONNECTION.prototype.decode = function(){
    // Việc parse chi tiết address không bắt buộc cho GrassServer hiện tại,
    // nên tạm thời chỉ skip đúng cấu trúc.

    function skipAddress(bb){
        if (bb.remaining() < 1) return;
        var version = bb.readByte();
        if (version === 4) {
            // IPv4: 4 bytes IP, 2 bytes port
            bb.skip(4 + 2);
        } else {
            // IPv6: 2 family, 2 port, 4 flow, 16 addr, 4 scope
            bb.skip(2 + 2 + 4 + 16 + 4);
        }
    }

    // Server address
    skipAddress(this.bb);

    // Internal address (20x)
    for (var i = 0; i < 20; i++) {
        if (this.bb.remaining() <= 0) break;
        skipAddress(this.bb);
    }

    if (this.bb.remaining() >= 16) {
        this.incomingTimestamp = this.bb.readLong();
        this.serverTimestamp = this.bb.readLong();
    }

    this.bb.flip();
};

console.log("NEW_INCOMING_CONNECTION.js loaded");

