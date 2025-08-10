declare module "web3.storage" {
  export class Web3Storage {
    constructor(config: { token: string });
    put(files: File[]): Promise<string>;
    get(cid: string): Promise<File[]>;
    list(cid: string): Promise<File[]>;
    delete(cid: string): Promise<void>;
  }
}
