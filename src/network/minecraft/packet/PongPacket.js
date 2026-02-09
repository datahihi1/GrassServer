PongPacket = function(identifier){
    this.identifier = identifier || 0;
    this.bb = new ByteBuffer();
};

PongPacket.prototype.encode = function(){
    this.bb.buffer[0] = minecraft.PONG;
    this.bb.offset = 1;

    this.bb.
        writeLong(this.identifier).
        flip().
        compact();
};

console.log("PongPacket.js loaded");

