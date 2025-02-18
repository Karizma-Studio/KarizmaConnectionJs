import * as signalR from '@microsoft/signalr';
import type { EventHandler, Response } from './types';

interface IConnection {
    id: string | null;
    isConnected: boolean;

    connect(url: string): Promise<void>;

    disconnect(): Promise<void>;

    on<T>(command: string, handler: EventHandler<T>): void;

    send(address: string, ...body: any[]): Promise<void>;

    request<TResponse>(
        address: string,
        ...body: any[]
    ): Promise<Response<TResponse>>;
}

export class Connection implements IConnection {
    private hubConnection: signalR.HubConnection | null = null;
    private lastConnectedUrl: string | null = null;
    private handlers: Map<string, EventHandler<any>> = new Map();

    constructor() {}

    public get id(): string | null {
        return this.hubConnection?.connectionId || null;
    }

    public get isConnected(): boolean {
        return (
            this.hubConnection?.state === signalR.HubConnectionState.Connected
        );
    }

    public async connect(url: string): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
        }

        console.info(`Connecting to: ${url}`);

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .build();

        this.hubConnection.onreconnecting((error) => {
            console.warn('Connection lost. Reconnecting...', error);
        });

        this.hubConnection.onreconnected((connectionId) => {
            console.info(`Reconnected with ID: ${connectionId}`);
        });

        this.hubConnection.onclose((error) => {
            console.warn('Connection closed.', error);
        });

        this.hubConnection.on(
            'HandleAction',
            (command: string, payload: any) => {
                const handler = this.handlers.get(command);
                if (handler) {
                    handler(payload);
                }
            },
        );

        await this.hubConnection.start();
        this.lastConnectedUrl = url;
        console.info('Karizma Connection Connected successfully.');
    }

    public async disconnect(): Promise<void> {
        if (!this.hubConnection) return;

        await this.hubConnection.stop();
        this.hubConnection = null;
        console.info('Disconnected successfully.');
    }

    public on<T>(command: string, handler: EventHandler<T>): void {
        this.handlers.set(command, handler);
    }

    public off(command: string): void {
        this.handlers.delete(command);
    }

    public async send(address: string, ...body: any[]): Promise<void> {
        await this.checkConnection();
        await this.hubConnection!.invoke('HandleAction', address, body);
    }

    public async request<TResponse>(
        address: string,
        ...body: any[]
    ): Promise<Response<TResponse>> {
        await this.checkConnection();
        const response = await this.hubConnection!.invoke<Response<TResponse>>(
            'HandleAction',
            address,
            body,
        );
        return response;
    }

    private async checkConnection(): Promise<void> {
        if (!this.hubConnection || !this.lastConnectedUrl) {
            throw new Error('Connection is not initialized.');
        }

        if (
            this.hubConnection.state === signalR.HubConnectionState.Disconnected
        ) {
            console.warn('Reconnecting to the last known URL...');
            await this.connect(this.lastConnectedUrl);
        }
    }

    public onReconnecting(callback: (error: Error | undefined) => void): void {
        if (!this.hubConnection) return;
        this.hubConnection.onreconnecting(callback);
    }
}
