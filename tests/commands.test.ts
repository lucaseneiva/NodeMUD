import { Player, Room, CommandResult } from "../src/domain/types";
import * as commands from "../src/domain/commands";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetRoom = vi.fn();
const mockGetExits = vi.fn();
const mockMove = vi.fn();
const mockSendMessage = vi.fn();

vi.mock("../src/domain/world", () => ({
  getRoom: (...args: unknown[]) => mockGetRoom(...args),
  getExits: (...args: unknown[]) => mockGetExits(...args),
  move: (...args: unknown[]) => mockMove(...args),
}));

vi.mock("../src/domain/player", () => ({
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  getCurrentRoomId: vi.fn(),
  setCurrentRoom: vi.fn(),
}));

const createMockPlayer = (): Player => ({
  name: "player1",
  character: {
    name: "player1",
    passwordHash: "$2b$10$hash",
    currentRoom: "start",
  },
  socket: {
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    destroy: vi.fn(),
    remoteAddress: "127.0.0.1",
    setKeepAlive: vi.fn(),
  } as any,
});

describe("commands", () => {
  let mockPlayer: Player;

  beforeEach(() => {
    mockPlayer = createMockPlayer();
    vi.clearAllMocks();
  });

  describe("parseCommand", () => {
    it("should parse a simple command", () => {
      const result = commands.parseCommand("north");

      expect(result.command).toBe("north");
      expect(result.args).toBe("");
    });

    it("should parse a command with arguments", () => {
      const result = commands.parseCommand("say hello world");

      expect(result.command).toBe("say");
      expect(result.args).toBe("hello world");
    });

    it("should handle empty input", () => {
      const result = commands.parseCommand("");

      expect(result.command).toBe("");
      expect(result.args).toBe("");
    });

    it("should handle whitespace-only input", () => {
      const result = commands.parseCommand("   ");

      expect(result.command).toBe("");
      expect(result.args).toBe("");
    });
  });

  describe("executeCommand", () => {
    it("should handle look command", async () => {
      const room: Room = {
        id: "start",
        title: "Starting Room",
        description: "You are in a small room.",
        exits: { north: "hallway" },
      };
      mockGetRoom.mockResolvedValue(room);

      const result = await commands.executeCommand(mockPlayer, "look", "");

      expect(result.success).toBe(true);
      expect(mockSendMessage).toHaveBeenCalledWith(
        mockPlayer,
        expect.stringContaining("Starting Room")
      );
    });

    it("should handle movement commands", async () => {
      const currentRoom: Room = {
        id: "start",
        title: "Start",
        description: "Desc",
        exits: { north: "hallway" },
      };
      const destRoom: Room = {
        id: "hallway",
        title: "Hallway",
        description: "A hallway",
        exits: { south: "start" },
      };
      mockGetRoom.mockResolvedValue(currentRoom);
      mockMove.mockResolvedValue({ success: true, room: destRoom });

      const result = await commands.executeCommand(mockPlayer, "north", "");

      expect(result.success).toBe(true);
    });

    it("should handle say command", async () => {
      const result = await commands.executeCommand(mockPlayer, "say", "hello");

      expect(result.success).toBe(true);
      expect(result.message).toContain('player1 says "hello"');
    });

    it("should handle help command", async () => {
      const result = await commands.executeCommand(mockPlayer, "help", "");

      expect(result.success).toBe(true);
      expect(result.message).toContain("Available commands");
    });

    it("should handle unknown command", async () => {
      const result = await commands.executeCommand(mockPlayer, "xyz", "");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Unknown command. Type 'help' for available commands.");
    });

    it("should handle quit command", async () => {
      const result = await commands.executeCommand(mockPlayer, "quit", "");

      expect(result.success).toBe(true);
      expect(mockPlayer.socket.end).toHaveBeenCalled();
    });
  });

  describe("handleInput", () => {
    it("should parse and execute a command", async () => {
      const room: Room = {
        id: "start",
        title: "Start",
        description: "Desc",
        exits: {},
      };
      mockGetRoom.mockResolvedValue(room);

      await commands.handleInput(mockPlayer, "look");

      expect(mockSendMessage).toHaveBeenCalled();
    });

    it("should handle multiple word commands", async () => {
      const room: Room = {
        id: "start",
        title: "Start",
        description: "Desc",
        exits: {},
      };
      mockGetRoom.mockResolvedValue(room);

      const result = await commands.handleInput(mockPlayer, "say hello world");

      expect(result.success).toBe(true);
    });
  });
});
