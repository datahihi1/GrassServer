/**
 * RakNet "Disconnect" (ID 0x15).
 *
 * Gói này chỉ chứa mỗi ID theo tài liệu RakNet.
 */

DISCONNECT = function(buf){
    if (buf && buf.buffer !== undefined) {
        this.bb = buf;
        this.bb.offset = 1; // nothing more to read
    } else {
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = 0x15;
        this.bb.offset = 1;
    }
};

DISCONNECT.prototype.decode = function(){
    // Không có payload
    this.bb.flip();
};

DISCONNECT.prototype.encode = function(){
    // Không có payload
    this.bb.flip();
    this.bb.compact();
};

console.log("DISCONNECT.js loaded");

