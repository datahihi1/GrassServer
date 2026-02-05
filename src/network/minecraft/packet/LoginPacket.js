LoginPacket = function(buf){
    this.bb = buf;
    this.bb.skip(1);
};
LoginPacket.prototype.decode = function(){
    this.protocol = this.bb.readInt();
    this.clientData = this.bb.readString();
    try {
        this.clientDataObj = JSON.parse(this.clientData);
        this.username = this.clientDataObj.displayName || this.clientDataObj.ThirdPartyName || "Unknown";
        this.uuid = this.clientDataObj.Identity || "";
    } catch(e) {
        this.username = "Unknown";
        this.uuid = "";
    }
};
console.log("LoginPacket.js loaded");