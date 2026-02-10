Player = function (ip, port, mtuSize) {
    this.ip = ip;
    this.port = port;
    this.ACKQueue = [];
    this.NACKQueue = [];
    this.recoveryQueue = {};
    this.packetQueue = new EncapsulatedPacket([]);
    this.mtuSize = mtuSize;
    this.sequencenumber = 0;
    this.lastSequenceNumber = 0;
    this.messageIndex = 0;
    this.orderIndex = 0;

    this.state = "HANDSHAKE";
    this.entityRuntimeId = 1;
    this.username = "";
    this.uuid = "";
    this.clientID = 0;
    this.sendPing = 0;
    
    console.log("New Player created ip=" + this.ip + " port=" + this.port + " mtuSize=" + this.mtuSize + " state=" + this.state);
    
    this.updateTask = setInterval(
        (function(self) {
            return function() {
                self.update(self);
            }
        })(this),
        1000/2
    );
};
Player.prototype.update = function(player) {
    if(player.ACKQueue.length > 0){

    }
    if(player.NACKQueue.length > 0){

    }
    if(player.packetQueue.packets.length > 0){
        player.packetQueue.sequencenumber++;
        player.packetQueue.encode();
        console.log("Sending EncapsulatedPacket sequence=" + player.packetQueue.sequencenumber + " packets=" + player.packetQueue.packets.length + " to " + player.ip + ":" + player.port);
        SocketInstance.sendPacket(player.packetQueue, player.ip, player.port);
        player.recoveryQueue[player.packetQueue.sequencenumber] = player.packetQueue.packets;
        player.packetQueue.packets = [];
    }
};
Player.prototype.handlePackets = function(e) {
    var packets = e.packets;

    // Handle sequence tracking properly
    if(this.lastSequenceNumber === 0){
        // First packet
        this.lastSequenceNumber = e.sequencenumber;
        console.log("First sequence: " + e.sequencenumber);
    }
    else if(e.sequencenumber == this.lastSequenceNumber + 1){
        this.lastSequenceNumber = e.sequencenumber;
        console.log("Correct sequence: " + e.sequencenumber);
    }
    else if(e.sequencenumber > this.lastSequenceNumber + 1){
        // Missing packets - add to NACK queue
        console.log("Missing sequences detected: " + (this.lastSequenceNumber + 1) + " to " + (e.sequencenumber - 1));
        for(var i = this.lastSequenceNumber + 1; i < e.sequencenumber; i++){
            if(this.NACKQueue.indexOf(i) === -1){
                this.NACKQueue.push(i);
            }
        }
        this.lastSequenceNumber = e.sequencenumber;
    }
    else{
        // Old/duplicate packet - should have been filtered by SocketHandler
        console.log("Old/duplicate sequence: " + e.sequencenumber + " (current: " + this.lastSequenceNumber + ")");
        return;
    }

    for(var i = 0; i < packets.length; i++){
        this.handlePacket(packets[i]);
    }
};
Player.prototype.handlePacket = function(pk){
    if(!pk || !pk.buffer){
        console.log("handlePacket: received invalid internal packet (no buffer), state: " + this.state);
        return;
    }

    pk.buffer.offset = 0;

    if(pk.buffer.remaining() <= 0){
        console.log("handlePacket: empty buffer, state: " + this.state);
        return;
    }

    var pkid = pk.buffer.readByte();

    if(pkid === undefined || pkid === null){
        console.log("handlePacket: could not read packet ID, state: " + this.state);
        return;
    }

    pkid = pkid & 0xFF;

    console.log("Handling packet ID: 0x" + pkid.toString(16) + " (" + pkid + "), state: " + this.state);

    switch(pkid){
        case minecraft.PING:
            if (pk.buffer.remaining() >= 8) {
                pk.buffer.offset = 1;
                var ident = pk.buffer.readLong();
                var pong = new PongPacket(ident);
                this.sendPacket(pong, true);
                console.log("Handled PING, sent PONG with identifier=" + ident);
            } else {
                console.log("PING packet too short, ignoring");
            }
            break;

        case minecraft.CONNECTION_REQUEST:
        case minecraft.CLIENT_CONNECT:
            if(this.state === "HANDSHAKE"){
                pk.buffer.offset = 0;
                var bufCopy = pk.buffer.copy();
                bufCopy.offset = 0;
                
                var session = 0;
                try {
                    var c = new ClientConnectPacket(bufCopy);
                    c.decode();
                    this.clientID = c.cid;
                    session = c.session;
                    this.sendPing = c.session;
                    console.log("Decoded ClientConnect: cid=" + c.cid + ", session=" + c.session);
                } catch(e) {
                    console.log("Trying ConnectionRequestPacket format...");
                    bufCopy.offset = 0;
                    var cr = new ConnectionRequestPacket(bufCopy);
                    cr.decode();
                    this.clientID = cr.clientID;
                    this.sendPing = cr.sendPing;
                    session = cr.sendPing;
                    console.log("Decoded ConnectionRequest: clientID=" + cr.clientID + ", sendPing=" + cr.sendPing);
                }

                var reply = new ConnectionRequestAcceptedPacket(
                    this.ip,
                    this.port,
                    session
                );
                this.sendPacket(reply, true);
                this.state = "SESSION";
                console.log("Sent CONNECTION_REQUEST_ACCEPTED, state -> SESSION");
            } else if(this.state === "SESSION"){
                console.log("CONNECTION_REQUEST retry detected, already in SESSION state - ignoring");
            } else {
                console.log("Ignoring CONNECTION_REQUEST - wrong state: " + this.state);
            }
            break;
            
        case minecraft.NEW_INCOMING_CONNECTION:
        case minecraft.CLIENT_HANDSHAKE:
            if(this.state === "SESSION"){
                pk.buffer.offset = 0;
                var nic = new NewIncomingConnectionPacket(pk.buffer.copy());
                nic.decode();
                this.state = "LOGIN";
                console.log("New incoming connection established, state -> LOGIN");

                var serverHandshake = new ServerHandshakePacket(this.port, this.sendPing);
                this.sendPacket(serverHandshake, true);
                console.log("Sent SERVER_HANDSHAKE");
            } else {
                console.log("Ignoring NEW_INCOMING_CONNECTION - wrong state: " + this.state);
            }
            break;

        case minecraft.LOGIN:
            if(this.state === "LOGIN"){
                pk.buffer.offset = 0;
                var login = new LoginPacket(pk.buffer.copy());
                login.decode();
                this.username = login.username;
                this.uuid = login.uuid;
                this.clientProtocol = login.protocol;
                
                console.log("Login packet received: username=" + this.username + ", protocol=" + login.protocol);
                
                if(minecraft.ACCEPTED_PROTOCOLS.indexOf(login.protocol) === -1){
                    var playStatus = new PlayStatusPacket(PlayStatusPacket.LOGIN_FAILED_CLIENT);
                    this.sendPacket(playStatus);
                    console.log("Rejected login: unsupported protocol " + login.protocol + " (supported: 0.12.0-0.12.3)");
                    break;
                }
                
                var playStatus = new PlayStatusPacket(PlayStatusPacket.LOGIN_SUCCESS);
                this.sendPacket(playStatus);
                console.log("Sent PLAY_STATUS (LOGIN_SUCCESS)");
                
                this.startGame();
                this.state = "GAME";
                console.log("Player logged in: " + this.username + ", state -> GAME");
            } else {
                console.log("Ignoring LOGIN - wrong state: " + this.state);
            }
            break;

        case minecraft.MOVE_PLAYER:
            if(this.state === "GAME"){
                pk.buffer.offset = 0;
                var move = new MovePlayerPacket(pk.buffer.copy());
                move.decode();
                console.log("Player moved to: " + move.x + ", " + move.y + ", " + move.z);
            }
            break;

        case minecraft.DISCONNECT:
            console.log("Player " + this.username + " disconnecting gracefully");
            this.close("Player disconnected");
            break;

        case minecraft.REQUEST_CHUNK_RADIUS:
            if(this.state === "GAME"){
                pk.buffer.offset = 0;
                var req = new RequestChunkRadiusPacket(pk.buffer.copy());
                req.decode();
                var chunkRadius = new ChunkRadiusUpdatedPacket(req.radius);
                this.sendPacket(chunkRadius);
                console.log("Chunk radius requested: " + req.radius);
            }
            break;

        case minecraft.REQUEST_CHUNK:
            if(this.state === "GAME" && pk.buffer.remaining() >= 8){
                pk.buffer.offset = 1;
                var cx = pk.buffer.readInt();
                var cz = pk.buffer.readInt();
                var chunkData = typeof generateChunk !== 'undefined' ? generateChunk(cx, cz) : new Buffer(6144);
                var chunkPk = new LevelChunkPacket(cx, cz, chunkData);
                this.sendPacket(chunkPk);
                console.log("Sent requested chunk (" + cx + ", " + cz + ")");
            }
            break;
            
        default:
            console.log("Not implemented data packet " + pkid + " (0x" + pkid.toString(16) + "), state: " + this.state);
            break;
    }
};
Player.prototype.close = function (msg){
    console.log("Closing player connection: " + (msg || "no reason"));

    // Clear the update task
    if(this.updateTask){
        clearInterval(this.updateTask);
        this.updateTask = null;
    }

    // Send disconnect packet
    var d = new Disconnect();
    this.sendPacket(d, true);

    // Remove from players list
    if(typeof SocketInstance !== 'undefined' && SocketInstance && SocketInstance.server && SocketInstance.server.players){
        var idx = SocketInstance.server.players.indexOf(this);
        if(idx !== -1){
            SocketInstance.server.players.splice(idx, 1);
            console.log("Player removed from server (remaining: " + SocketInstance.server.players.length + ")");
        }
    }
};
Player.prototype.sendPacket = function(pk, immediate){
    pk.encode();
    var pkId = pk.bb.buffer[0];
    if(pkId !== undefined && pkId !== null){
        pkId = pkId & 0xFF;
        console.log("Queuing packet: 0x" + pkId.toString(16) + " (" + pkId + "), size: " + pk.bb.buffer.length);
    } else {
        console.log("Queuing packet: (undefined), size: " + pk.bb.buffer.length);
    }
    var internalPk = {
        bb: pk.bb,
        reliability: 2,
        hasSplit: false,
        messageIndex: this.messageIndex++,
        orderIndex: this.orderIndex++,
        orderChannel: 0
    };
    this.packetQueue.packets.push(internalPk);

    var pkIdCheck = (pk.bb.buffer[0] & 0xFF);
    if(immediate || pkIdCheck === minecraft.SERVER_HANDSHAKE || pkIdCheck === minecraft.CONNECTION_REQUEST_ACCEPTED){
        this.flushPacketQueue();
    }
};

Player.prototype.flushPacketQueue = function(){
    if(this.packetQueue.packets.length > 0){
        this.packetQueue.sequencenumber++;
        this.packetQueue.encode();
        console.log("Flushing packet queue: sequence=" + this.packetQueue.sequencenumber + ", packets=" + this.packetQueue.packets.length);
        SocketInstance.sendPacket(this.packetQueue, this.ip, this.port);
        this.recoveryQueue[this.packetQueue.sequencenumber] = this.packetQueue.packets;
        this.packetQueue.packets = [];
    }
};

Player.prototype.startGame = function(){
    this.entityRuntimeId = Math.floor(Math.random() * 1000000) + 1;

    var startGame = new StartGamePacket(
        this.entityRuntimeId,
        0,
        0,
        1,
        0,
        "GrassServer",
        1234567890
    );
    this.sendPacket(startGame);

    this.initWorld();
};

Player.prototype.initWorld = function(){
    var setTime = new SetTimePacket(0);
    this.sendPacket(setTime);

    var setDifficulty = new SetDifficultyPacket(1); // Normal
    this.sendPacket(setDifficulty);

    var setGameType = new SetPlayerGameTypePacket(0); // Survival
    this.sendPacket(setGameType);

    var spawnPlayer = new SpawnPlayerPacket(
        this.entityRuntimeId,
        0,
        1,
        0,
        0,
        0
    );
    this.sendPacket(spawnPlayer);

    this.sendChunks();
};

Player.prototype.sendChunks = function(){
    var radius = 2;
    for(var x = -radius; x <= radius; x++){
        for(var z = -radius; z <= radius; z++){
            var chunkData = generateChunk(x, z);
            var chunk = new LevelChunkPacket(x, z, chunkData);
            this.sendPacket(chunk);
        }
    }
    console.log("Sent level chunks (bedrock 3x3x1)");
};
console.log("Player.js loaded");