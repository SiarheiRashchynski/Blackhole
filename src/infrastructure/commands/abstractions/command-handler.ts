export interface CommandHandler<T> {
    handle(request: T): Promise<void>;
}
