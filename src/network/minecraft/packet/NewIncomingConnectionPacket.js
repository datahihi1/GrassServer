NewIncomingConnectionPacket = function(buf){
    this.bb = buf;
    this.bb.skip(1);
};
NewIncomingConnectionPacket.prototype.decode = function(){
    this.serverAddress = this.bb.readByte();
    var ip = [];
    for(var i = 0; i < 4; i++){
        ip.push(this.bb.readByte());
    }
    this.serverIP = ip.join('.');
    this.serverPort = this.bb.readShort();
    this.clientID = this.bb.readLong();
    this.sendPing = this.bb.readLong();
    this.serverPing = this.bb.readLong();
};
console.log("NewIncomingConnectionPacket.js loaded");