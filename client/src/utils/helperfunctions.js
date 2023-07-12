import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex,utf8ToBytes } from "ethereum-cryptography/utils";
export function hashMessage(message) {
    return toHex(keccak256(utf8ToBytes(message)));
}