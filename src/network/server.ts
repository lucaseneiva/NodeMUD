import { createServer, Server, Socket } from "net";
import { attachSocketHandler } from "./socket-handler";
import { Session, createSession, handleSessionInput, getPlayer } from "./session";

export class MudServer {
  private server: Server | null = null;
  private sessions: Map<Socket, Session> = new Map();

  start(port: number): void {
    this.server = createServer((socket) => {
      this.handleConnection(socket);
    });

    this.server.listen(port, () => {
      console.log(`MUD server running on port ${port}`);
    });
  }

  private async handleConnection(socket: Socket): Promise<void> {
    console.log(`Client connected: ${socket.remoteAddress}`);

    const session = await createSession(socket);
    this.sessions.set(socket, session);

    attachSocketHandler(
      socket,
      async (line) => {
        const sess = this.sessions.get(socket);
        if (sess) {
          await handleSessionInput(sess, line);
        }
      },
      () => {
        this.handleDisconnect(socket);
      }
    );
  }

  private handleDisconnect(socket: Socket): void {
    const session = this.sessions.get(socket);
    if (session) {
      const player = getPlayer(session);
      if (player) {
        console.log(`Player disconnected: ${player.name}`);
      } else {
        console.log(`Client disconnected: ${socket.remoteAddress}`);
      }
    }
    this.sessions.delete(socket);
    socket.destroy();
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
