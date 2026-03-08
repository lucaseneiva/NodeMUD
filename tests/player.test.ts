import { Character, Room, Player } from "../src/domain/types";
import * as player from "../src/domain/player";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createMockSocket = () => ({
  write: vi.fn(),
  end: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  destroy: vi.fn(),
  remoteAddress: "127.0.0.1",
  setKeepAlive: vi.fn(),
});

describe("player", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;
  let testCharacter: Character;

  beforeEach(() => {
    mockSocket = createMockSocket();
    testCharacter = {
      name: "player1",
      passwordHash: "$2b$10$hash",
      currentRoom: "start",
    };
    vi.clearAllMocks();
  });

  describe("createPlayer", () => {
    it("should create a player with character data", () => {
      const result = player.createPlayer(testCharacter, mockSocket as any);

      expect(result.name).toBe("player1");
      expect(result.character).toEqual(testCharacter);
      expect(result.socket).toBe(mockSocket);
    });
  });

  describe("sendMessage", () => {
    it("should send a message to the player's socket", () => {
      const p = player.createPlayer(testCharacter, mockSocket as any);
      player.sendMessage(p, "Hello, player!");

      expect(mockSocket.write).toHaveBeenCalledWith("Hello, player!\r\n");
    });
  });

  describe("getCurrentRoomId", () => {
    it("should return the player's current room ID", () => {
      const p = player.createPlayer(testCharacter, mockSocket as any);
      expect(player.getCurrentRoomId(p)).toBe("start");
    });
  });

  describe("setCurrentRoom", () => {
    it("should update the player's current room", () => {
      const p = player.createPlayer(testCharacter, mockSocket as any);
      player.setCurrentRoom(p, "hallway");

      expect(p.character.currentRoom).toBe("hallway");
    });
  });

  describe("updateCharacter", () => {
    it("should update the player's character data", () => {
      const p = player.createPlayer(testCharacter, mockSocket as any);
      const updatedChar: Character = {
        ...testCharacter,
        currentRoom: "armory",
      };

      player.updateCharacter(p, updatedChar);

      expect(p.character).toEqual(updatedChar);
    });
  });
});
