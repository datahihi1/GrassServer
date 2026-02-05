ChunkRadiusUpdatedPacket = function(radius){
    this.bb = new ByteBuffer();
    this.radius = radius || 4;
    this.bb.writeByte(minecraft.CHUNK_RADIUS_UPDATED);
};
ChunkRadiusUpdatedPacket.prototype.encode = function(){
    this.bb.writeInt(this.radius);
    this.bb.flip();
    this.bb.compact();
};
console.log("ChunkRadiusUpdatedPacket.js loaded");
