/**
 * FRAME_SET_PACKET
 *
 * Wrapper/alias cho `EncapsulatedPacket` hiện có trong
 * `src/network/minecraft/packet/EncapsulatedPacket.js`.
 *
 * Trong RakNet wiki, "Frame Set Packet" (0x80–0x8D) chứa nhiều frame
 * đã được encapsulate. Ở code hiện tại, logic này đã được hiện thực
 * trong `EncapsulatedPacket`, nên lớp này chỉ đóng vai trò adapter.
 */

FRAME_SET_PACKET = function(bufOrPackets){
    // Nếu được truyền ByteBuffer, sử dụng như phía decode
    // Nếu được truyền mảng packet nội bộ, sử dụng như phía encode
    return new EncapsulatedPacket(bufOrPackets);
};

console.log("FRAME_SET_PACKET.js loaded");

