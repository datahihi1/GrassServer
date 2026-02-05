MovePlayerPacket = function(buf){
    this.bb = buf;
    this.bb.skip(1);
};
MovePlayerPacket.prototype.decode = function(){
    this.entityRuntimeId = this.bb.readLong();
    this.x = this.bb.readFloat();
    this.y = this.bb.readFloat();
    this.z = this.bb.readFloat();
    this.pitch = this.bb.readFloat();
    this.yaw = this.bb.readFloat();
    this.headYaw = this.bb.readFloat();
    this.mode = this.bb.readByte();
    this.onGround = this.bb.readByte();
    this.riddenEntityRuntimeId = this.bb.readLong();
};
console.log("MovePlayerPacket.js loaded");