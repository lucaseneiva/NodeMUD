import { MudServer } from "./network/server";

const PORT = 2323;

const server = new MudServer();
server.start(PORT);

process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.stop();
  process.exit(0);
});
