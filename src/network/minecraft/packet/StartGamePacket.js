StartGamePacket = function(entityRuntimeId, dimension, spawnX, spawnY, spawnZ, levelName, seed){
    this.bb = new ByteBuffer();
    this.entityRuntimeId = entityRuntimeId || 1;
    this.dimension = dimension || 0;
    this.spawnX = spawnX || 0;
    this.spawnY = spawnY || 64;
    this.spawnZ = spawnZ || 0;
    this.levelName = levelName || "DirtServer";
    this.seed = seed || 1234567890;
    this.bb.writeByte(minecraft.START_GAME);
};
StartGamePacket.prototype.encode = function(){
    this.bb.writeLong(this.entityRuntimeId);

    this.bb.writeLong(this.entityRuntimeId);

    //Game mode (0=Survival, 1=Creative)
    this.bb.writeInt(1);

    //Position
    this.bb.writeFloat(this.spawnX);
    this.bb.writeFloat(this.spawnY);
    this.bb.writeFloat(this.spawnZ);
    
    // Yaw, Pitch
    this.bb.writeFloat(0);
    this.bb.writeFloat(0);
    
    // Seed (must be != 0)
    this.bb.writeInt(this.seed);
    
    // Dimension (must be 0 for overworld)
    this.bb.writeByte(this.dimension);
    
    // Generator
    this.bb.writeInt(1); // Default generator
    
    // Gamemode
    this.bb.writeInt(0); // Survival
    
    // Difficulty
    this.bb.writeByte(1); // Normal
    
    // Spawn position
    this.bb.writeInt(Math.floor(this.spawnX));
    this.bb.writeInt(Math.floor(this.spawnY));
    this.bb.writeInt(Math.floor(this.spawnZ));
    
    // Has loaded spawn
    this.bb.writeByte(1);
    
    // Level name (must not be empty)
    this.bb.writeString(this.levelName);
    
    // World time
    this.bb.writeInt(0);
    
    // Enchantment seed
    this.bb.writeInt(0);
    
    this.bb.flip();
    this.bb.compact();
};
console.log("StartGamePacket.js loaded");