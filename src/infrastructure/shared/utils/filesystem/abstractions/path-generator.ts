import { randomUUID } from "crypto";

export interface PathGenerator {
    generatePath(): Promise<string>;
}