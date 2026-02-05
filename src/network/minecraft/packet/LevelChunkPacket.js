LevelChunkPacket = function(chunkX, chunkZ, chunkData){
    this.bb = new ByteBuffer();
    this.chunkX = chunkX || 0;
    this.chunkZ = chunkZ || 0;
    this.chunkData = chunkData || new ByteBuffer();
    this.bb.writeByte(minecraft.LEVEL_CHUNK);
};
LevelChunkPacket.prototype.encode = function(){
    this.bb.writeInt(this.chunkX);
    this.bb.writeInt(this.chunkZ);
    var dataLength = (this.chunkData && this.chunkData.length) ? this.chunkData.length : 0;
    this.bb.writeShort(1);
    this.bb.writeShort(0);
    this.bb.writeInt(dataLength);
    if(this.chunkData && dataLength > 0){
        if(Buffer.isBuffer(this.chunkData)){
            this.bb.append(this.chunkData, "binary");
        } else if(this.chunkData.buffer){
            this.bb.append(this.chunkData.buffer, "binary");
        } else {
            this.bb.append(this.chunkData, "binary");
        }
    }
    this.bb.writeByte(0);
    this.bb.writeShort(0);
    this.bb.flip();
    this.bb.compact();
};
console.log("LevelChunkPacket.js loaded");