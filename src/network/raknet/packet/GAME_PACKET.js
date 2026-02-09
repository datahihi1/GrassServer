/**
 * GAME_PACKET (0xFE)
 *
 * Theo Bedrock protocol: "Game Packet" là lớp bọc (thường nén zlib)
 * cho các packet gameplay thực tế. Đối với phiên bản MCPE cũ mà
 * GrassServer nhắm tới, phần lớn packet gameplay được gửi thẳng,
 * không cần xử lý batch/phức tạp.
 *
 * Ở đây ta cung cấp lớp bọc tối thiểu:
 * - Decode: bỏ qua byte ID, còn lại buffer bên trong.
 * - Encode: ghi lại ID 0xFE rồi append nội dung thô.
 * Nếu sau này cần hỗ trợ nén/batching, có thể mở rộng lớp này.
 */

GAME_PACKET = function(bufOrPayload){
    if (bufOrPayload && bufOrPayload.buffer !== undefined) {
        // ByteBuffer đến từ mạng
        this.bb = bufOrPayload;
        this.bb.offset = 1; // bỏ qua ID 0xFE
        this.payload = this.bb.copy(this.bb.offset, this.bb.limit);
    } else {
        // Xây dựng packet để gửi, payload là ByteBuffer
        this.payload = bufOrPayload || new ByteBuffer();
        this.bb = new ByteBuffer();
        this.bb.buffer[0] = 0xfe; // ID Game Packet theo wiki
        this.bb.offset = 1;
    }
};

GAME_PACKET.prototype.decode = function(){
    // Payload đã được lấy trong constructor khi decode
    this.bb.flip();
};

GAME_PACKET.prototype.encode = function(){
    // Ghi lại payload thô sau ID 0xFE
    this.bb.offset = 1;
    this.bb = ByteBuffer.concat([this.bb.reset(), this.payload]);
    this.bb.flip();
    this.bb.compact();
};

console.log("GAME_PACKET.js loaded");

