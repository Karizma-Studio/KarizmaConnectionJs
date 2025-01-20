import { Connection } from "../src/connection";

describe("Connection", () => {
    let conn: Connection;

    beforeEach(() => {
        conn = new Connection();
    });

    test("should initialize without errors", () => {
        expect(conn.isConnected).toBe(false);
    });

    test("should throw an error when calling 'send' without connection", async () => {
        await expect(conn.send("SendMessage", "test")).rejects.toThrow("Connection is not initialized.");
    });
});
