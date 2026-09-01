declare module "heic-decode" {
  interface DecodedImage {
    width: number;
    height: number;
    data: Uint8Array;
  }
  interface DecodeOptions {
    buffer: ArrayBuffer | Buffer | Uint8Array;
  }
  export default function decode(options: DecodeOptions): Promise<DecodedImage>;
}