import { Socket } from "net";

export type Direction = "north" | "south" | "east" | "west" | "up" | "down";

export interface Room {
  id: string;
  title: string;
  description: string;
  exits: Partial<Record<Direction, string>>;
}

export interface Character {
  name: string;
  passwordHash: string;
  currentRoom: string;
}

export interface Player {
  character: Character;
  socket: Socket;
  name: string;
}

export type AuthResult =
  | { success: true; character: Character }
  | { success: false; error: string };

export type MoveResult =
  | { success: true; room: Room }
  | { success: false; error: string };

export interface CommandResult {
  success: boolean;
  message: string;
}
