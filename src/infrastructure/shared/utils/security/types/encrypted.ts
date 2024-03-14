export class Encrypted {
    private readonly _content: string;

    private readonly _iv: string;

    private readonly _algorithm: string;

    private readonly _delimiter = '$';

    public constructor(encryptedContent: string);
    public constructor(content: string, algorithm: string, iv: string);
    public constructor(rawOrEncrypted: string, algorithm?: string, iv?: string) {
        if (iv && algorithm) {
            this._content = rawOrEncrypted;
            this._iv = iv;
            this._algorithm = algorithm;
        } else {
            const [algorithm, iv, content] = this.parseEncrypted(rawOrEncrypted);
            this._iv = iv;
            this._algorithm = algorithm;
            this._content = content;
        }
    }

    public get content(): string {
        return this._content;
    }

    public get iv(): string {
        return this._iv;
    }

    public get algorithm(): string {
        return this._algorithm;
    }

    public toString(): string {
        return [this._algorithm, this._iv, this._content].join('$');
    }

    private parseEncrypted(encrypted: string): [algorithm: string, iv: string, content: string] {
        const [algorithm, iv, content] = encrypted.toString().split(this._delimiter).filter(Boolean);

        if (!algorithm || !iv || !content) throw new Error('Invalid encrypted data');
        return [algorithm, iv, content];
    }
}
