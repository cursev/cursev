import type { AbstractMsg, BitStream } from "./net";

export class CustomMsg implements AbstractMsg {
    type: 'custom' = 'custom';
    message: string = '';
    color: string = '#ffffff';
    playerId: number = 0;

    serialize(s: BitStream) {
        s.writeString(this.message, 255);
        s.writeString(this.color, 7);
        s.writeUint16(this.playerId);
        s.writeAlignToNextByte();
    }

    deserialize(s: BitStream) {
        this.message = s.readString(255);
        this.color = s.readString(7);
        this.playerId = s.readUint16();
        s.readAlignToNextByte();
    }
}