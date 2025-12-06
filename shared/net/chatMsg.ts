import type { AbstractMsg, BitStream } from "./net";

export class ChatMsg implements AbstractMsg {
    message: string = "";
    playerId: number = 0;
    playerName: string = "";

    serialize(s: BitStream) {
        s.writeString(this.message, 255);
        s.writeUint16(this.playerId);
        s.writeString(this.playerName, 16);
        s.writeAlignToNextByte();
    }

    deserialize(s: BitStream) {
        this.message = s.readString(255);
        this.playerId = s.readUint16();
        this.playerName = s.readString(16);
        s.readAlignToNextByte();
    }
}

