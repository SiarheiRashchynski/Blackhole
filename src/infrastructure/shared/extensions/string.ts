interface String {
    firstLetterUpperCase(): string;
}

String.prototype.firstLetterUpperCase = function (this: string): string {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
