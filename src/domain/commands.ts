import { Player, Direction, CommandResult } from "./types";
import * as world from "./world";
import * as player from "./player";

export interface ParsedCommand {
  command: string;
  args: string;
}

const DIRECTIONS: Direction[] = ["north", "south", "east", "west", "up", "down"];

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return { command: "", args: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { command: trimmed.toLowerCase(), args: "" };
  }

  return {
    command: trimmed.substring(0, spaceIndex).toLowerCase(),
    args: trimmed.substring(spaceIndex + 1),
  };
}

export async function executeCommand(
  p: Player,
  command: string,
  args: string
): Promise<CommandResult> {
  switch (command) {
    case "look":
      return handleLook(p);
    case "say":
      return handleSay(p, args);
    case "north":
    case "south":
    case "east":
    case "west":
    case "up":
    case "down":
      return handleMove(p, command as Direction);
    case "who":
      return handleWho(p);
    case "help":
      return handleHelp(p);
    case "quit":
      return handleQuit(p);
    default:
      return {
        success: false,
        message: "Unknown command. Type 'help' for available commands.",
      };
  }
}

async function handleLook(p: Player): Promise<CommandResult> {
  const room = await world.getRoom(p.character.currentRoom);

  if (!room) {
    return { success: false, message: "You are in a void." };
  }

  let output = `\n${room.title}\n${room.description}\n`;

  const exits = Object.keys(room.exits);
  if (exits.length > 0) {
    output += `Exits: ${exits.join(", ")}\n`;
  }

  player.sendMessage(p, output);
  return { success: true, message: output };
}

async function handleSay(p: Player, args: string): Promise<CommandResult> {
  if (!args) {
    return { success: false, message: "Say what?" };
  }

  const message = `${p.name} says "${args}"`;
  player.sendMessage(p, message);
  return { success: true, message: message };
}

async function handleMove(p: Player, direction: Direction): Promise<CommandResult> {
  const result = await world.move(p.character.currentRoom, direction);

  if (!result.success) {
    player.sendMessage(p, result.error);
    return { success: false, message: result.error };
  }

  p.character.currentRoom = result.room.id;
  player.sendMessage(p, `You go ${direction}.`);

  let output = `\n${result.room.title}\n${result.room.description}\n`;
  const exits = Object.keys(result.room.exits);
  if (exits.length > 0) {
    output += `Exits: ${exits.join(", ")}\n`;
  }

  player.sendMessage(p, output);
  return { success: true, message: output };
}

function handleWho(p: Player): CommandResult {
  player.sendMessage(p, `You are ${p.name}.`);
  return { success: true, message: p.name };
}

function handleHelp(p: Player): CommandResult {
  const helpText = `
Available commands:
  look           - Look around the current room
  north/south/east/west/up/down - Move in a direction
  say <message>  - Say something to the room
  who            - Show your character name
  quit           - Disconnect from the game
  help           - Show this help message
`;
  player.sendMessage(p, helpText);
  return { success: true, message: helpText };
}

function handleQuit(p: Player): CommandResult {
  player.sendMessage(p, "Goodbye!");
  p.socket.end();
  return { success: true, message: "Goodbye!" };
}

export async function handleInput(p: Player, input: string): Promise<CommandResult> {
  const { command, args } = parseCommand(input);

  if (!command) {
    return { success: true, message: "" };
  }

  return executeCommand(p, command, args);
}
