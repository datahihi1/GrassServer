RequestChunkRadiusPacket = function(buf){
    this.bb = buf;
    this.bb.skip(1);
};
RequestChunkRadiusPacket.prototype.decode = function(){
    this.radius = this.bb.readInt();
};
console.log("RequestChunkRadiusPacket.js loaded");