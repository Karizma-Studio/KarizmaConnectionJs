# Karizma Connection JS

A lightweight, TypeScript-based SDK that wraps [KarizmaConnection](https://github.com/Karizma-Studio/KarizmaConnection/) functionality. 


---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Example](#basic-example)
    - [Handling Reconnects](#handling-reconnects)
    - [Sending Data](#sending-data)
    - [Request-Response Pattern](#request-response-pattern)
- [API Reference](#api-reference)
    - [Connection Class](#connection-class)
    - [Types](#types)
- [Building and Testing](#building-and-testing)
- [License](#license)
- [Contributing](#contributing)

---

## Features

- **Easy Setup**: Seamlessly create connections to SignalR Hubs in just a few lines of code.
- **Automatic Reconnect**: Built-in support for re-establishing dropped connections.
- **Two Communication Patterns**:
    1. **Send/Receive** (fire-and-forget style)
    2. **Request/Response** (send data and get a typed response back)
- **Node and Browser**: Can be used in server-side applications (Node) or front-end frameworks (e.g., React, Vue, Angular).
- **TypeScript Friendly**: Ships with full type definitions (`.d.ts`).

---

## Installation

```bash
npm install @karizma-studio/karizma-connection-js
```

Or if you use Yarn:

```bash
yarn add @karizma-studio/karizma-connection-js
```

---

## Usage

### Connect To Server

```ts
import { Connection } from '@karizma-studio/karizma-connection-js';

const connection = new Connection();

await connection.connect('https://your-backend.com/hub');
```


### Sending Data

To send data (or invoke a method) on the server, use `send(address: string, ...body: any[]): Promise<void>`:

```ts
// Example of sending a message with a complex payload
await connection.send('SendMessageToGroup', {
  groupId: 'group-123',
  text: 'Hello group!',
  timestamp: new Date(),
});
```

### Request-Response Pattern

If your server method returns data, use `request<TResponse>(address: string, ...body: any[])`:

```ts
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const response = await connection.request<UserProfile>('GetUserProfile', { userId: '123' });

if (response.error) {
  console.error('Error code:', response.error.code);
  console.error('Error message:', response.error.message);
} else {
  console.log('Received user profile data:', response.data);
}
```

---

## API Reference

### Connection Class

#### `constructor()`
Creates a new Connection instance.

#### `connect(url: string): Promise<void>`
Establishes a connection to the specified SignalR hub.

- **url**: The URL of your SignalR hub endpoint.

```ts
await connection.connect('https://your-signalr-endpoint/hub');
```

#### `disconnect(): Promise<void>`
Gracefully closes the connection.

```ts
await connection.disconnect();
```

#### `on<T>(command: string, handler: EventHandler<T>): void`
Registers an event handler for an incoming `command`.

- **command**: A string identifier for your server messages.
- **handler**: A callback function to handle the incoming data.

```ts
connection.on('OnNewMessage', (data) => { console.log(data); });
```

#### `send(address: string, ...body: any[]): Promise<void>`
Sends data to the server without expecting a response.

- **address**: The method name or command recognized by the server.
- **body**: Any data you want to send (spreads into an array).

```ts
await connection.send('BroadcastMessage', { text: 'Hello World' });
```

#### `request<TResponse>(address: string, ...body: any[]): Promise<Response<TResponse>>`
Sends data to the server expecting a typed response.

- **address**: The method name or command recognized by the server.
- **body**: Any data you want to send (spreads into an array).
- **returns**: A `Response<TResponse>` object containing `.data` or `.error`.

```ts
const response = await connection.request<UserProfile>('GetUserProfile', { userId: '123' });
```

```

### Types

#### `Response<T>`
The default interface for responses:

```ts
interface Response<T> {
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}
```

#### `EventHandler<T>`
Used as the type for event handlers:

```ts
type EventHandler<T> = (data: T) => void;
```

---

## Building and Testing

1. **Build** the project:
   ```bash
   npm run build
   ```
2. **Run ESLint**:
   ```bash
   npm run lint
   ```
3. **Format** with Prettier:
   ```bash
   npm run format
   ```
4. **Run Tests** (using [Jest](https://github.com/facebook/jest)):
   ```bash
   npm test
   ```

---

## License

[MIT](https://github.com/Karizma-Studio/KarizmaConnectionJs/blob/main/LICENSE)

---

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or create a pull request.

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push the branch and open a Pull Request.

Thank you for your interest in improving this project!

---

**Happy coding!** If you have any questions or need further assistance, feel free to open an issue or a discussion on the [GitHub repository](https://github.com/Karizma-Studio/KarizmaConnectionJs).
