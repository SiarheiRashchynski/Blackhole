export interface PathGenerator {
    generatePath(): Promise<string>;
}
