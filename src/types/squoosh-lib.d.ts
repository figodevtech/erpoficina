declare module "@squoosh/lib" {
  export class ImagePool {
    constructor(threads?: number);
    ingestImage(data: Buffer | Uint8Array | ArrayBuffer): any;
    close(): Promise<void>;
  }
}
