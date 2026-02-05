ServerHandshakePacket = function(port, session){
    this.port = port;
    this.session = session;
    this.bb = new ByteBuffer();
}
ServerHandshakePacket.prototype.encode = function(){
    var body = new ByteBuffer();
    body.append([0x04, 0x3f, 0x57, 0xfe], "binary");
    body.writeByte(0xcd);
    body.writeShort(this.port);
    body.flip();
    body = ByteBuffer.concat([body.reset(), EncapsulatedPacket.writeLTriad(4)]);
    body.offset = body.limit;
    body.flip();
    body = ByteBuffer.concat([body.reset(), [0xf5, 0xff, 0xff, 0xf5]]);
    body.offset = body.limit;
    for(var i = 0; i < 9; i++){
        body.flip();
        body = ByteBuffer.concat([body.reset(), EncapsulatedPacket.writeLTriad(4)]);
        body.offset = body.limit;
        body.flip();
        body = ByteBuffer.concat([body.reset(), [0xff,  0xff, 0xff, 0xff]]);
        body.offset = body.limit;
    }
    body.flip();
    body = ByteBuffer.concat([body.reset(), [0x00, 0x00]]);
    body.offset = body.limit;

    var sessionBuf = new ByteBuffer();
    sessionBuf.writeLong(this.session);
    sessionBuf.flip();
    body = ByteBuffer.concat([body.reset(), sessionBuf]);
    body.offset = body.limit;

    body.flip();
    body = ByteBuffer.concat([body.reset(), [0x00, 0x00, 0x00, 0x00, 0x04, 0x44, 0x0b, 0xa9]]);
    body.compact();

    this.bb = ByteBuffer.concat([[minecraft.SERVER_HANDSHAKE], body.buffer]);
    this.bb.compact();
    
    console.log("ServerHandshakePacket encoded: size=" + this.bb.buffer.length + ", first byte=0x" + this.bb.buffer[0].toString(16));
};
console.log("ServerHandshakePacket.js loaded");