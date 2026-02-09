/**
 * RakNet "Connection Request Accepted" (ID 0x10).
 *
 * Cấu trúc theo https://minecraft.wiki/w/RakNet:
 * - 0x10
 * - Client address (address)
 * - System index (short)
 * - Internal IDs (10x address)
 * - Request time (Long)
 * - Time (Long)
 *
 * Đây là bản thuần RakNet; tầng gameplay đã dùng
 * `ConnectionRequestAcceptedPacket` trong minecraft/packet.
 */

CONNECTION_REQUEST_ACCEPTED = function(bufOrInfo){
    if (bufOrInfo && bufOrInfo.buffer !== undefined) {
        this.bb = bufOrInfo;
        this.bb.offset = 1;
    } else {
        bufOrInfo = bufOrInfo || {};
        this.clientIP = bufOrInfo.clientIP || "0.0.0.0";
        this.clientPort = bufOrInfo.clientPort || 0;
        this.requestTime = bufOrInfo.requestTime || 0;
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = 0x10;
        this.bb.offset = 1;
    }
};

CONNECTION_REQUEST_ACCEPTED.prototype._writeAddress = function(bb, ip, port){
    // RakNet address (IPv4 kiểu PE):
    // - 1 byte: version (4)
    // - 4 byte: IPv4 octet bitwise NOT
    // - 2 byte: port big-endian
    bb.writeByte(4);
    var parts = ip.split('.');
    for (var i = 0; i < 4; i++) {
        var o = parseInt(parts[i], 10);
        if (isNaN(o) || o < 0 || o > 255) o = 0;
        bb.writeByte(255 - o);
    }
    bb.writeByte((port >> 8) & 0xff);
    bb.writeByte(port & 0xff);
};

CONNECTION_REQUEST_ACCEPTED.prototype.encode = function(){
    this.bb.offset = 1;

    // Client address
    this._writeAddress(this.bb, this.clientIP, this.clientPort);

    // System index
    this.bb.writeShort(0);

    // Internal IDs: 10x dummy address
    for (var i = 0; i < 10; i++) {
        this._writeAddress(this.bb, "255.255.255.255", 19132);
    }

    // Request time, current time
    this.bb.writeLong(this.requestTime || Date.now());
    this.bb.writeLong(Date.now());

    this.bb.flip();
    this.bb.compact();
};

console.log("CONNECTION_REQUEST_ACCEPTED.js loaded");

