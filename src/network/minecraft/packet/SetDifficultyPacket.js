SetDifficultyPacket = function(difficulty){
    this.bb = new ByteBuffer();
    this.difficulty = difficulty || 1;
    this.bb.writeByte(minecraft.SET_DIFFICULTY);
};
SetDifficultyPacket.prototype.encode = function(){
    this.bb.writeInt(this.difficulty);
    this.bb.flip();
    this.bb.compact();
};
console.log("SetDifficultyPacket.js loaded");