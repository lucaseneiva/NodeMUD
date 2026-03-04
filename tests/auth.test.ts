import { Character } from "../src/domain/types";

const mockFindByName = jest.fn();
const mockSave = jest.fn();

jest.mock("../src/persistence/characters", () => ({
  __esModule: true,
  default: {
    findByName: (...args: unknown[]) => mockFindByName(...args),
    save: (...args: unknown[]) => mockSave(...args),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as auth from "../src/domain/auth";

describe("auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new character with valid credentials", async () => {
      mockFindByName.mockResolvedValue(null);
      mockSave.mockResolvedValue(undefined);

      const result = await auth.register("player1", "password123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.character).toBeDefined();
        expect(result.character.name).toBe("player1");
      }
      expect(mockSave).toHaveBeenCalled();
    });

    it("should fail if character name already exists", async () => {
      mockFindByName.mockResolvedValue({
        name: "player1",
        passwordHash: "hash",
        currentRoom: "start",
      });

      const result = await auth.register("player1", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Character name already exists");
      }
    });

    it("should fail if password is too short", async () => {
      const result = await auth.register("player1", "short");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Password must be at least 6 characters");
      }
    });

    it("should fail if name is empty", async () => {
      const result = await auth.register("", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Character name is required");
      }
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const storedCharacter: Character = {
        name: "player1",
        passwordHash: "$2b$10$testhash",
        currentRoom: "start",
      };
      mockFindByName.mockResolvedValue(storedCharacter);

      const bcrypt = require("bcrypt");
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await auth.login("player1", "password123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.character).toEqual(storedCharacter);
      }
    });

    it("should fail if character does not exist", async () => {
      mockFindByName.mockResolvedValue(null);

      const result = await auth.login("player1", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Invalid credentials");
      }
    });

    it("should fail if password is incorrect", async () => {
      const storedCharacter: Character = {
        name: "player1",
        passwordHash: "$2b$10$testhash",
        currentRoom: "start",
      };
      mockFindByName.mockResolvedValue(storedCharacter);

      const bcrypt = require("bcrypt");
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await auth.login("player1", "wrongpassword");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Invalid credentials");
      }
    });
  });
});
