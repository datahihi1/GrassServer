SocketHandler = function (port){
    var config = require("../config.js");
    this.config = config;
    this.server = dgram.createSocket("udp4");
    this.server.players = [];
    this.server.bind(port);
    this.server.on("error", function (err) {
        console.log("server error:\n" + err.stack);
        this.close();
    });
    this.server.on("message", function (msg, rinfo) {
        var buf = new ByteBuffer().append(msg, "hex");
        var id = buf.buffer[0];
        if(id >= raknet.UNCONNECTED_PING && id <= raknet.ADVERTISE_SYSTEM){
            console.log("server got: " + id + " from " + rinfo.address + ":" + rinfo.port);
            switch(id){
                case raknet.UNCONNECTED_PING:
                    var u = new UNCONNECTED_PING(buf);
                    u.decode();
                    var ad = new UNCONNECTED_PONG(u.pingID, this.players.length, config.server.maxPlayers);
                    ad.encode();
                    this.send(ad.bb.buffer, 0,ad.bb.buffer.length, rinfo.port, rinfo.address); //Send waiting data buffer
                    break;
                case raknet.OPEN_CONNECTION_REQUEST_1: //ID_OPEN_CONNECTION_REQUEST_1
                    var r = new OPEN_CONNECTION_REQUEST_1(buf);
                    r.decode();
                    console.log("OPEN_CONNECTION_REQUEST_1: protocol=" + r.protocol + ", mtuSize=" + r.mtusize + " from " + rinfo.address + ":" + rinfo.port);
                    if(raknet.ACCEPTED_RAKNET_PROTOCOLS.indexOf(r.protocol) === -1){
                        console.log("REJECTED: Client " + rinfo.address + ":" + rinfo.port + " uses RakNet protocol " + r.protocol + ", but server only supports " + raknet.ACCEPTED_RAKNET_PROTOCOLS.join(", ") + " (MCPE 0.12.1-0.12.3)");
                        var res = new INCOMPATIBLE_PROTOCOL_VERSION();
                        res.encode();
                        this.send(res.bb.buffer,0, res.bb.buffer.length, rinfo.port, rinfo.address);
                    }
                    else{
                        var res = new OPEN_CONNECTION_REPLY_1(r.mtusize);
                        res.encode();
                        this.send(res.bb.buffer,0, res.bb.buffer.length, rinfo.port, rinfo.address);
                        console.log("Sent OPEN_CONNECTION_REPLY_1 to " + rinfo.address + ":" + rinfo.port + " (mtuSize=" + r.mtusize + ")");
                    }
                    break;
                case raknet.OPEN_CONNECTION_REQUEST_2: //ID_OPEN_CONNECTION_REQUEST_2
                    var r = new OPEN_CONNECTION_REQUEST_2(buf);
                    r.decode();
                    console.log("OPEN_CONNECTION_REQUEST_2 from " + rinfo.address + ":" + rinfo.port + " (mtuSize=" + r.mtusize + ")");

                    if(this.players.length >= config.server.maxPlayers){
                        console.log("REJECTED: Server full (" + this.players.length + "/" + config.server.maxPlayers + ") - rejecting " + rinfo.address + ":" + rinfo.port);
                        var disconnect = new Disconnect();
                        disconnect.encode();
                        this.send(disconnect.bb.buffer, 0, disconnect.bb.buffer.length, rinfo.port, rinfo.address);
                        break;
                    }

                    var res = new OPEN_CONNECTION_REPLY_2(rinfo.port, r.mtusize);
                    res.encode();
                    var p = new Player(rinfo.address, rinfo.port, r.mtusize);
                    if(!this.players.clientExists(p)){
                        this.players.push(p); //Add player to clients
                        console.log("Added player ip=" + p.ip + " port=" + p.port + " mtuSize=" + p.mtuSize + " (total players=" + this.players.length + "/" + config.server.maxPlayers + ")");
                        this.send(res.bb.buffer, 0, res.bb.buffer.length, rinfo.port, rinfo.address); //Send waiting data buffer
                        console.log("Sent OPEN_CONNECTION_REPLY_2 to " + rinfo.address + ":" + rinfo.port);
                    }
                    else{
                        console.log("OPEN_CONNECTION_REQUEST_2 ignored: player already exists for " + rinfo.address + ":" + rinfo.port);
                    }
                    break;
                default:
                    console.log("Unknown raknet packet.");
                    break;
            }
        }
        else if(id >= raknet.DATA_PACKET_0 &&  id <= raknet.DATA_PACKET_F){
            console.log("Received DATA_PACKET from " + rinfo.address + ":" + rinfo.port + ", looking for player...");
            var found = false;
            for(var i = 0; i < this.players.length; i++){
                console.log("  Checking player " + i + ": " + this.players[i].ip + ":" + this.players[i].port + " (state: " + this.players[i].state + ")");
                if(this.players[i].ip == rinfo.address && this.players[i].port == rinfo.port){
                    var e = new EncapsulatedPacket(buf);
                    e.decode();
                    console.log("  Found player! Sequence: " + e.sequencenumber + ", packets: " + e.packets.length);

                    // Check if this is a duplicate/old sequence
                    if(e.sequencenumber <= this.players[i].lastSequenceNumber && this.players[i].lastSequenceNumber !== 0){
                        console.log("  Duplicate/old sequence " + e.sequencenumber + " (last: " + this.players[i].lastSequenceNumber + "), ignoring");
                        return;
                    }

                    this.players[i].handlePackets(e);

                    // Use the ACK class instead of manual construction
                    var ack = new ACK([e.sequencenumber]);
                    ack.encode();
                    this.send(ack.bb.buffer, 0, ack.bb.buffer.length, rinfo.port, rinfo.address);
                    console.log("  Sent ACK for sequence " + e.sequencenumber);
                    found = true;
                    return;
                }
            }
            // Try matching by IP only (port might have changed)
            if(!found){
                for(var i = 0; i < this.players.length; i++){
                    if(this.players[i].ip == rinfo.address){
                        console.log("  Matched by IP only, updating port from " + this.players[i].port + " to " + rinfo.port);
                        this.players[i].port = rinfo.port;
                        var e = new EncapsulatedPacket(buf);
                        e.decode();
                        console.log("  Found player by IP! Sequence: " + e.sequencenumber + ", packets: " + e.packets.length);

                        // Check if this is a duplicate/old sequence
                        if(e.sequencenumber <= this.players[i].lastSequenceNumber && this.players[i].lastSequenceNumber !== 0){
                            console.log("  Duplicate/old sequence " + e.sequencenumber + " (last: " + this.players[i].lastSequenceNumber + "), ignoring");
                            return;
                        }

                        this.players[i].handlePackets(e);

                        // Use the ACK class instead of manual construction
                        var ack = new ACK([e.sequencenumber]);
                        ack.encode();
                        this.send(ack.bb.buffer, 0, ack.bb.buffer.length, rinfo.port, rinfo.address);
                        console.log("  Sent ACK for sequence " + e.sequencenumber);
                        return;
                    }
                }
            }
            console.log("Couldn't find a player for " + rinfo.address + ":" + rinfo.port);
        }
        else if(id == raknet.ACK || id == raknet.NACK){
            console.log("Got the ACK");
        }
        else{
            console.log("Unknown packet: " + id);
        }
    });
    this.server.on("listening", function () {
        var address = this.address();
        console.log("GrassServer started on " + address.address + ":" + address.port);
    });
};
SocketHandler.prototype.sendPacket = function(pk, ip, port){
    this.server.send(pk.bb.buffer, 0, pk.bb.buffer.length, port, ip);
};
console.log("SocketHandler.js loaded");