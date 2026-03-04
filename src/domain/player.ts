import { Character, Player } from "./types";
import { Socket } from "net";

export function createPlayer(character: Character, socket: Socket): Player {
  return {
    character,
    socket,
    name: character.name,
  };
}

export function sendToSocket(socket: Socket, message: string): void {
  socket.write(message + "\r\n");
}

export function sendMessage(p: Player, message: string): void {
  p.socket.write(message + "\r\n");
}

export function getCurrentRoomId(p: Player): string {
  return p.character.currentRoom;
}

export function setCurrentRoom(p: Player, roomId: string): void {
  p.character.currentRoom = roomId;
}

export function updateCharacter(p: Player, character: Character): void {
  p.character = character;
  p.name = character.name;
}
