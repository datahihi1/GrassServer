SpawnPlayerPacket = function(entityRuntimeId, x, y, z, yaw, pitch){
    this.bb = new ByteBuffer();
    this.entityRuntimeId = entityRuntimeId || 1;
    this.x = x || 0;
    this.y = y || 64;
    this.z = z || 0;
    this.yaw = yaw || 0;
    this.pitch = pitch || 0;
    this.bb.writeByte(minecraft.SPAWN_PLAYER);
};
SpawnPlayerPacket.prototype.encode = function(){
    this.bb.writeLong(this.entityRuntimeId);
    this.bb.writeLong(this.entityRuntimeId);
    this.bb.writeFloat(this.x);
    this.bb.writeFloat(this.y);
    this.bb.writeFloat(this.z);
    this.bb.writeFloat(this.yaw);
    this.bb.writeFloat(this.pitch);
    this.bb.writeFloat(0);
    this.bb.writeShort(0);
    this.bb.writeString("");
    this.bb.flip();
    this.bb.compact();
};
console.log("SpawnPlayerPacket.js loaded");