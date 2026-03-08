import { Room, Direction, MoveResult } from "../src/domain/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWorldRepo = {
  findRoomById: vi.fn(),
  findAllRooms: vi.fn(),
};

vi.mock("../src/persistence/world", () => ({
  __esModule: true,
  default: {
    findRoomById: (...args: unknown[]) => mockWorldRepo.findRoomById(...args),
    findAllRooms: (...args: unknown[]) => mockWorldRepo.findAllRooms(...args),
  },
}));

import * as world from "../src/domain/world";

const testRoom: Room = {
  id: "start",
  title: "Starting Room",
  description: "You are in a small room.",
  exits: { north: "hallway" },
};

const hallwayRoom: Room = {
  id: "hallway",
  title: "Long Hallway",
  description: "A long corridor stretches before you.",
  exits: { south: "start", east: "armory" },
};

const armoryRoom: Room = {
  id: "armory",
  title: "Armory",
  description: "Weapons line the walls.",
  exits: { west: "hallway" },
};

describe("world", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRoom", () => {
    it("should return room when it exists", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(testRoom);

      const result = await world.getRoom("start");

      expect(result).toEqual(testRoom);
    });

    it("should return null when room does not exist", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(null);

      const result = await world.getRoom("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getExits", () => {
    it("should return exits for a room", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(testRoom);

      const result = await world.getExits("start");

      expect(result).toEqual({ north: "hallway" });
    });

    it("should return empty object when room does not exist", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(null);

      const result = await world.getExits("nonexistent");

      expect(result).toEqual({});
    });
  });

  describe("move", () => {
    it("should move player to valid exit", async () => {
      mockWorldRepo.findRoomById
        .mockResolvedValueOnce(testRoom)
        .mockResolvedValueOnce(hallwayRoom);

      const result = await world.move("start", "north");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.room).toEqual(hallwayRoom);
      }
    });

    it("should fail when direction has no exit", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(testRoom);

      const result = await world.move("start", "east");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("You cannot go that way.");
      }
    });

    it("should fail when room does not exist", async () => {
      mockWorldRepo.findRoomById.mockResolvedValue(null);

      const result = await world.move("nonexistent", "north");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Room not found.");
      }
    });

    it("should fail when destination room does not exist", async () => {
      const brokenRoom: Room = {
        id: "start",
        title: "Start",
        description: "Desc",
        exits: { north: "missing" },
      };
      mockWorldRepo.findRoomById
        .mockResolvedValueOnce(brokenRoom)
        .mockResolvedValueOnce(null);

      const result = await world.move("start", "north");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Destination room not found.");
      }
    });
  });

  describe("getAllRooms", () => {
    it("should return all rooms", async () => {
      const rooms = [testRoom, hallwayRoom, armoryRoom];
      mockWorldRepo.findAllRooms.mockResolvedValue(rooms);

      const result = await world.getAllRooms();

      expect(result).toEqual(rooms);
    });
  });
});
