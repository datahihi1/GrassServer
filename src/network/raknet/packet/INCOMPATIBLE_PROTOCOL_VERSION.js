INCOMPATIBLE_PROTOCOL_VERSION = function(){
    this.bb = new ByteBuffer();
    this.bb.buffer[0] = raknet.INCOMPATIBLE_PROTOCOL_VERSION;
    this.bb.offset = 1;
}
INCOMPATIBLE_PROTOCOL_VERSION.prototype.encode = function(){
    this.bb.
        writeByte(raknet.STRUCTURE).
        append(raknet.MAGIC, "hex").
        writeLong(raknet.SERVER_ID).
        flip().
        compact();
    console.log("Sent INCOMPATIBLE_PROTOCOL_VERSION: server requires RakNet protocol " + raknet.STRUCTURE + ", only supports MCPE 0.12.1-0.12.3");
}
console.log("INCOMPATIBLE_PROTOCOL_VERSION.js loaded");