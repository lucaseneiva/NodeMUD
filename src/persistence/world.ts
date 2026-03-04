import { Room } from "../domain/types";
import * as fs from "fs/promises";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../../data");
const WORLD_FILE = path.join(DATA_DIR, "world.json");

export interface WorldRepository {
  findRoomById(roomId: string): Promise<Room | null>;
  findAllRooms(): Promise<Room[]>;
}

async function loadWorld(): Promise<Room[]> {
  try {
    const data = await fs.readFile(WORLD_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

const worldRepo: WorldRepository = {
  async findRoomById(roomId: string): Promise<Room | null> {
    const rooms = await loadWorld();
    return rooms.find((r) => r.id === roomId) || null;
  },

  async findAllRooms(): Promise<Room[]> {
    return loadWorld();
  },
};

export default worldRepo;
