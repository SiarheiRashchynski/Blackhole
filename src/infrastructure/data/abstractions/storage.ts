export interface Storage {
    read(): Promise<string | undefined>;
    write(data: string): Promise<void>;
    delete(): Promise<void>;
}
