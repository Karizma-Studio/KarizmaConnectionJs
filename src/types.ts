export interface Response<T> {
    Result?: T;
    Error?: {
        Code: number;
        Message: string;
    };
}

export type EventHandler<T> = (data: T) => void;
