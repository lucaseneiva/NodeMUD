import { Socket } from "net";

export type LineHandler = (line: string) => void;
export type CloseHandler = () => void;

export function attachSocketHandler(
  socket: Socket,
  onLine: LineHandler,
  onClose: CloseHandler
): void {
  let buffer = "";

  socket.on("data", (chunk: Buffer) => {
    const text = chunk.toString("utf-8");
    buffer += text;

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.substring(0, newlineIndex).replace(/\r/g, "");
      buffer = buffer.substring(newlineIndex + 1);

      if (line.length > 0) {
        onLine(line);
      }
    }
  });

  socket.on("close", () => {
    onClose();
  });

  socket.on("error", () => {
    onClose();
  });
}
