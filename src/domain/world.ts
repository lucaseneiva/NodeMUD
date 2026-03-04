import { Room, Direction, MoveResult } from "./types";
import worldRepo from "../persistence/world";

export async function getRoom(roomId: string): Promise<Room | null> {
  return worldRepo.findRoomById(roomId);
}

export async function getExits(roomId: string): Promise<Partial<Record<Direction, string>>> {
  const room = await worldRepo.findRoomById(roomId);
  if (!room) {
    return {};
  }
  return room.exits;
}

export async function move(roomId: string, direction: Direction): Promise<MoveResult> {
  const currentRoom = await worldRepo.findRoomById(roomId);

  if (!currentRoom) {
    return { success: false, error: "Room not found." };
  }

  const destinationId = currentRoom.exits[direction];

  if (!destinationId) {
    return { success: false, error: "You cannot go that way." };
  }

  const destinationRoom = await worldRepo.findRoomById(destinationId);

  if (!destinationRoom) {
    return { success: false, error: "Destination room not found." };
  }

  return { success: true, room: destinationRoom };
}

export async function getAllRooms(): Promise<Room[]> {
  return worldRepo.findAllRooms();
}
