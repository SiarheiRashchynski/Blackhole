export interface CommandHandler<T> {
    handle(request: T): void;
}
