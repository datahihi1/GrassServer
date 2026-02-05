/**
 * RakNet ID_CONNECTION_REQUEST_ACCEPTED (0x10).
 * Format theo wiki.vg/Raknet_Protocol:
 * - Client address (1 byte version + 4 bytes IP + 2 bytes port)
 * - System index (short, 0)
 * - Internal IDs: 10x address (255.255.255.255:19132)
 * - Request time (Long), Time (Long)
 */
ConnectionRequestAcceptedPacket = function(clientIP, clientPort, requestTime){
    this.bb = new ByteBuffer();
    this.clientIP = clientIP || "0.0.0.0";
    this.clientPort = clientPort || 0;
    this.requestTime = requestTime || 0;
};
ConnectionRequestAcceptedPacket.prototype.encode = function(){
    this.bb.writeByte(minecraft.CONNECTION_REQUEST_ACCEPTED);

    function writeAddress(bb, ip, port) {
        // RakNet \"address\" (PE style):
        // - 1 byte: version (4)
        // - 4 bytes: IPv4 octets bitwise NOT (255 - octet)
        // - 2 bytes: port in network order (big-endian)
        bb.writeByte(4);
        var parts = ip.split('.');
        for (var i = 0; i < 4; i++) {
            var o = parseInt(parts[i], 10);
            if (isNaN(o) || o < 0 || o > 255) o = 0;
            bb.writeByte(255 - o);
        }
        bb.writeByte((port >> 8) & 0xff);
        bb.writeByte(port & 0xff);
    }

    // Client address
    writeAddress(this.bb, this.clientIP, this.clientPort);

    // System index
    this.bb.writeShort(0);

    // Internal IDs: 10x address (255.255.255.255:19132)
    for (var j = 0; j < 10; j++) {
        writeAddress(this.bb, "255.255.255.255", 19132);
    }

    // Request time (Long), Time (Long) - RakNet little-endian
    this.bb.writeLong(this.requestTime);
    this.bb.writeLong(Date.now());

    this.bb.flip();
    this.bb.compact();
};
console.log("ConnectionRequestAcceptedPacket.js loaded");
