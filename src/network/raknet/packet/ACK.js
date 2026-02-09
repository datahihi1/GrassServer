ACK = function(bufOrSequences){
    if (bufOrSequences && bufOrSequences.buffer !== undefined) {
        this.bb = bufOrSequences;
        this.bb.offset = 1;
        this.sequences = [];
    } else {
        this.sequences = bufOrSequences || [];
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = raknet.ACK;
        this.bb.offset = 1;
    }
};

/**
 * Decode ACK packet according to RakNet spec.
 * Expands ranges into a flat list of sequence numbers in this.sequences.
 * Reference: `RakNet` documentation on Minecraft Wiki.
 */
ACK.prototype.decode = function(){
    this.sequences = [];

    if (this.bb.remaining() < 2) {
        this.bb.flip();
        return;
    }

    var recordCount = this.bb.readShort();

    for (var i = 0; i < recordCount; i++) {
        if (this.bb.remaining() < 1) break;

        var isSingle = this.bb.readByte() !== 0; // true => single sequence, false => range

        if (isSingle) {
            if (this.bb.remaining() < 3) break;
            var seq = (this.bb.readByte() & 0xFF) |
                      ((this.bb.readByte() & 0xFF) << 8) |
                      ((this.bb.readByte() & 0xFF) << 16);
            this.sequences.push(seq);
        } else {
            if (this.bb.remaining() < 6) break;
            var start = (this.bb.readByte() & 0xFF) |
                        ((this.bb.readByte() & 0xFF) << 8) |
                        ((this.bb.readByte() & 0xFF) << 16);
            var end = (this.bb.readByte() & 0xFF) |
                      ((this.bb.readByte() & 0xFF) << 8) |
                      ((this.bb.readByte() & 0xFF) << 16);
            if (end < start) {
                // Malformed range; skip
                continue;
            }
            for (var s = start; s <= end; s++) {
                this.sequences.push(s);
            }
        }
    }

    this.bb.flip();
};

/**
 * Encode this.sequences into an ACK packet.
 * For simplicity, each sequence is encoded as a single record (no ranges).
 */
ACK.prototype.encode = function(){
    this.bb.offset = 1; // keep ID at buffer[0]

    var count = this.sequences.length;
    this.bb.writeShort(count);

    for (var i = 0; i < count; i++) {
        var seq = this.sequences[i] >>> 0;

        // Single sequence flag
        this.bb.writeByte(1);

        // 3-byte little-endian sequence number
        this.bb.writeByte(seq & 0xFF);
        this.bb.writeByte((seq >> 8) & 0xFF);
        this.bb.writeByte((seq >> 16) & 0xFF);
    }

    this.bb.flip();
    this.bb.compact();
};

console.log("ACK.js loaded");

