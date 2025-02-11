export interface Response<T> {
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}

export type EventHandler<T> = (data: T) => void;
