declare global {
    interface Array<T> {
        someAsync(predicate: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<boolean>;
        findAsync(predicate: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T | undefined>;
    }
}

Array.prototype.someAsync = async function <T>(
    this: T[],
    predicate: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<boolean> {
    for (let index = 0; index < this.length; index++) {
        if (await predicate(this[index], index, this)) {
            return true;
        }
    }
    return false;
};

Array.prototype.findAsync = async function <T>(
    this: T[],
    predicate: (value: T, index: number, array: T[]) => Promise<T | undefined>,
): Promise<T | undefined> {
    for (let index = 0; index < this.length; index++) {
        if (await predicate(this[index], index, this)) {
            return this[index];
        }
    }
    return undefined;
};

export {};
