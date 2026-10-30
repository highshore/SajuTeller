import { describe, expect, it } from 'vitest';
import { encodeQr, qrSvgPath, rsRemainder } from './qr';

// Reference matrix for "HELLO", decoded back with OpenCV's QR detector when it was recorded.
const HELLO = ["111111101001001111111","100000101111001000001","101110100010101011101","101110101010101011101","101110100001001011101","100000100001101000001","111111101010101111111","000000001001100000000","101101110101101001011","011011010111111001100","100010100101000000011","101100010001001111010","010111111000100100101","000000001111001000101","111111101001100100000","100000101010000111110","101110100000111111011","101110101011001011110","101110101100101100100","100000100010010110001","111111101010010100000"];

describe('QR code for the companion link', () => {
  it('[AC-13c] Reed–Solomon matches the published ISO 18004 example (HELLO WORLD, 1-M)', () => {
    expect(rsRemainder([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17], 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  });
  it('[AC-13c] is generated on the device and matches the verified reference', () => {
    expect(encodeQr('HELLO').map(r => r.map(v => (v ? 1 : 0)).join(''))).toEqual(HELLO);
  });
  it('[AC-13c] fits a full share link and grows the version with length', () => {
    const link = 'https://sajuteller.vercel.app/live/watch/AAAAAAAAAAAAAAAA#' + 'k'.repeat(43);
    const m = encodeQr(link);
    expect(m.length).toBe(41); // version 6
    expect(m.every(row => row.length === m.length)).toBe(true);
    expect(qrSvgPath(m).size).toBe(49);
    expect(() => encodeQr('x'.repeat(300))).toThrow();
  });
});
