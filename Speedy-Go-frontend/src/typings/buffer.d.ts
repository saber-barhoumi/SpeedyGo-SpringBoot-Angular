// This is a simplified Buffer type declaration for Ably SDK
interface Buffer {
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toString(encoding?: string, start?: number, end?: number): string;
  [index: number]: number; // Mimic Uint8Array indexing
  length: number; // Mimic Uint8Array length property
}

declare var Buffer: {
  new(str: string, encoding?: string): Buffer;
  new(size: number): Buffer;
  new(array: Uint8Array): Buffer;
  new(arrayBuffer: ArrayBuffer): Buffer;
  new(array: any[]): Buffer;
  isBuffer(obj: any): boolean;
  byteLength(string: string, encoding?: string): number;
  concat(list: Buffer[], totalLength?: number): Buffer;
};