import * as signalR from '@microsoft/signalr';
import type { EventHandler, Response } from './types.js';

interface IConnection {
    id: string | null;
    isConnected: boolean;

    connect(url: string, autoReconnect: boolean): Promise<void>;
    disconnect(): Promise<void>;

    on<T>(command: string, handler: EventHandler<T>): void;
    off(command: string): void;

    send(address: string, ...body: any[]): Promise<void>;
    request<TResponse>(address: string, ...body: any[]): Promise<Response<TResponse>>;

    onReconnecting(callback: (error: Error | undefined) => void): void;
    onConnected(callback: (connectionId?: string) => void): void;
    onReConnected(callback: (connectionId?: string) => void): void;
    onDisconnected(callback: (error?: Error) => void): void;
}

export class Connection implements IConnection {
    private hubConnection: signalR.HubConnection | null = null;
    private lastConnectedUrl: string | null = null;

    private handlers: Map<string, EventHandler<any>> = new Map();

    private connectedCallbacks: Array<(connectionId?: string) => void> = [];
    private reconnectingCallbacks: Array<(error?: Error) => void> = [];
    private reconnectedCallbacks: Array<(connectionId?: string) => void> = [];
    private disconnectedCallBacks: Array<(error?: Error) => void> = [];

    constructor() {}

    public get id(): string | null {
        return this.hubConnection?.connectionId || null;
    }

    public get isConnected(): boolean {
        return this.hubConnection?.state === signalR.HubConnectionState.Connected;
    }

    public async connect(url: string, autoReconnect: boolean = false): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
        }

        console.info(`Connecting to: ${url}`);

        const builder = new signalR.HubConnectionBuilder().withUrl(url);

        if (autoReconnect) {
            builder.withAutomaticReconnect();
        }

        this.hubConnection = builder.build();

        for (const cb of this.reconnectingCallbacks) {
            this.hubConnection.onreconnecting(cb);
        }
        for (const cb of this.reconnectedCallbacks) {
            this.hubConnection.onreconnected(cb);
        }
        for (const cb of this.disconnectedCallBacks) {
            this.hubConnection.onclose(cb);
        }

        this.hubConnection.onreconnecting((error) => {
            console.warn('Connection lost. Reconnecting...', error);
        });

        this.hubConnection.onreconnected((connectionId) => {
            console.info(`Reconnected with ID: ${connectionId}`);
        });

        this.hubConnection.onclose((error) => {
            console.warn('Connection closed.', error);
        });

        this.hubConnection.on('HandleAction', (command: string, payload: any) => {
            const handler = this.handlers.get(command);
            if (handler) {
                handler(payload);
            }
        });

        await this.hubConnection.start();
        this.lastConnectedUrl = url;
        console.info('Karizma Connection Connected successfully.');

        for (const cb of this.connectedCallbacks) {
            cb(this.hubConnection?.connectionId ?? undefined);
        }

        for (const [command, handler] of this.handlers.entries()) {
            this.hubConnection.on(command, handler);
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.hubConnection) return;

        await this.hubConnection.stop();
        this.hubConnection = null;
        console.info('Disconnected successfully.');
    }

    public on<T>(command: string, handler: EventHandler<T>): void {
        console.info(`Registering handler for command "${command}".`);
        this.handlers.set(command, handler);

        if (this.hubConnection) {
            this.hubConnection.on(command, handler);
        }
    }

    public off(command: string): void {
        console.info(`Removing handler for command "${command}".`);
        this.handlers.delete(command);

        if (this.hubConnection) {
            this.hubConnection.off(command);
        }
    }

    public async send(address: string, ...body: any[]): Promise<void> {
        await this.checkConnection();
        await this.hubConnection!.invoke('HandleAction', address, body);
    }

    public async request<TResponse>(address: string, ...body: any[]): Promise<Response<TResponse>> {
        await this.checkConnection();
        return await this.hubConnection!.invoke<Response<TResponse>>('HandleAction', address, body);
    }

    private async checkConnection(): Promise<void> {
        if (!this.hubConnection || !this.lastConnectedUrl) {
            throw new Error('Connection is not initialized.');
        }

        if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
            console.warn('Reconnecting to the last known URL...');
            await this.connect(this.lastConnectedUrl);
        }
    }


    public onReconnecting(callback: (error?: Error) => void): void {
        this.reconnectingCallbacks.push(callback);

        if (this.hubConnection) {
            this.hubConnection.onreconnecting(callback);
        }
    }

    public onConnected(callback: (connectionId?: string) => void): void {
        this.connectedCallbacks.push(callback);
    }

    public onReConnected(callback: (connectionId?: string) => void): void {
        this.reconnectedCallbacks.push(callback);

        if (this.hubConnection) {
            this.hubConnection.onreconnected(callback);
        }
    }

    public onDisconnected(callback: (error?: Error) => void): void {
        this.disconnectedCallBacks.push(callback);

        if (this.hubConnection) {
            this.hubConnection.onclose(callback);
        }
    }
}
