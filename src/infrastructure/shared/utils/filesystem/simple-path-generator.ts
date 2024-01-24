import { randomUUID } from "crypto";
import { PathGenerator } from "./abstractions/path-generator";

export class SimplePathGenerator implements PathGenerator {
    async generatePath() {
        return randomUUID();
    }
}