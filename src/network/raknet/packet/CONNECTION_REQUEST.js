/**
 * RakNet "Connection Request" (ID 0x09).
 *
 * Cấu trúc theo https://minecraft.wiki/w/RakNet:
 * - 0x09
 * - GUID (Long)
 * - Time (Long)
 * - Use security (Boolean)
 *
 * Lưu ý: Đây là packet tầng RakNet, khác với
 * `ConnectionRequestPacket` ở tầng Bedrock/minecraft.
 */

CONNECTION_REQUEST = function(buf){
    if (buf && buf.buffer !== undefined) {
        this.bb = buf;
        this.bb.offset = 1; // skip ID
    } else {
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = 0x09;
        this.bb.offset = 1;
        this.guid = 0;
        this.time = 0;
        this.useSecurity = false;
    }
};

CONNECTION_REQUEST.prototype.decode = function(){
    this.guid = this.bb.readLong();
    this.time = this.bb.readLong();
    this.useSecurity = this.bb.readByte() !== 0;
    this.bb.flip();
};

CONNECTION_REQUEST.prototype.encode = function(){
    this.bb.offset = 1;
    this.bb.
        writeLong(this.guid || raknet.SERVER_ID).
        writeLong(this.time || Date.now()).
        writeByte(this.useSecurity ? 1 : 0).
        flip().
        compact();
};

console.log("CONNECTION_REQUEST.js loaded");

