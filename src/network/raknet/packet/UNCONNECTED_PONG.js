UNCONNECTED_PONG = function(pingID, onlinePlayers){
    const config = require("../../../config.js");
    onlinePlayers = onlinePlayers || 0;
    this.name = "MCPE;" + config.server.motd + ";34;" + config.server.version + ";" + onlinePlayers + ";" + config.server.maxPlayers + ";1234567890;Test;Survival";
    this.bb = new ByteBuffer();
    this.pingID = pingID;
    this.bb.buffer[0] = raknet.UNCONNECTED_PONG;
    this.bb.offset = 1;
};

UNCONNECTED_PONG.prototype.encode = function(){
    this.bb.
        writeLong(this.pingID).
        writeLong(raknet.SERVER_ID).
        append(raknet.MAGIC, "hex").
        writeShort(this.name.length).
        writeString(this.name).
        flip().
        compact();
};
console.log("UNCONNECTED_PONG.js loaded");