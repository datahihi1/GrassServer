PlayStatusPacket = function(status){
    this.bb = new ByteBuffer();
    this.status = status || PlayStatusPacket.LOGIN_SUCCESS;
    this.bb.writeByte(minecraft.PLAY_STATUS);
};
PlayStatusPacket.LOGIN_SUCCESS = 0;
PlayStatusPacket.LOGIN_FAILED_CLIENT = 1;
PlayStatusPacket.LOGIN_FAILED_SERVER = 2;
PlayStatusPacket.PLAYER_SPAWN = 3;

PlayStatusPacket.prototype.encode = function(){
    this.bb.writeInt(this.status);
    this.bb.flip();
    this.bb.compact();
};
console.log("PlayStatusPacket.js loaded");