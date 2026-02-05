SetTimePacket = function(time){
    this.bb = new ByteBuffer();
    this.time = time || 0;
    this.bb.writeByte(minecraft.SET_TIME);
};
SetTimePacket.prototype.encode = function(){
    this.bb.writeInt(this.time);
    this.bb.flip();
    this.bb.compact();
};
console.log("SetTimePacket.js loaded");