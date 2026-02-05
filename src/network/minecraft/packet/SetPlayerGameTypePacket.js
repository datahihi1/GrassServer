SetPlayerGameTypePacket = function(gameType){
    this.bb = new ByteBuffer();
    this.gameType = gameType || 0;
    this.bb.writeByte(minecraft.SET_PLAYER_GAME_TYPE);
};
SetPlayerGameTypePacket.prototype.encode = function(){
    this.bb.writeInt(this.gameType);
    this.bb.flip();
    this.bb.compact();
};
console.log("SetPlayerGameTypePacket.js loaded");