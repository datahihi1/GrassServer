ConnectionRequestPacket = function(buf){
    this.bb = buf;
    this.bb.skip(1);
};
ConnectionRequestPacket.prototype.decode = function(){
    this.clientID = this.bb.readLong();
    this.sendPing = this.bb.readLong();
    this.useSecurity = this.bb.readByte();
};
console.log("ConnectionRequestPacket.js loaded");