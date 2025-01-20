export interface Response<T> {
    data?: T;
    error?: {
        code: number;
        message: string;
    };
}

export type EventHandler<T> = (data: T) => void;
