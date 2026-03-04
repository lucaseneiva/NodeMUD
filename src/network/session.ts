import { Socket } from "net";
import { Player } from "../domain/types";
import { createPlayer, sendToSocket } from "../domain/player";
import * as auth from "../domain/auth";
import * as commands from "../domain/commands";
import characterRepo from "../persistence/characters";

export type SessionState = "CONNECTING" | "AUTH_NAME" | "AUTH_PASSWORD" | "PLAYING";

export interface Session {
  socket: Socket;
  state: SessionState;
  player?: Player;
  authName?: string;
  authAction?: "login" | "register";
}

export async function createSession(socket: Socket): Promise<Session> {
  const session: Session = {
    socket,
    state: "CONNECTING",
  };

  sendToSocket(socket, "Welcome to Meu-MUD!");
  sendToSocket(socket, "Enter character name:");
  session.state = "AUTH_NAME";

  return session;
}

export async function handleSessionInput(session: Session, input: string): Promise<void> {
  switch (session.state) {
    case "AUTH_NAME":
      return handleAuthName(session, input);
    case "AUTH_PASSWORD":
      return handleAuthPassword(session, input);
    case "PLAYING":
      return handleGameCommand(session, input);
  }
}

async function handleAuthName(session: Session, input: string): Promise<void> {
  const name = input.trim();

  if (!name) {
    sendToSocket(session.socket, "Character name cannot be empty. Enter character name:");
    return;
  }

  const existing = await characterRepo.findByName(name);
  session.authName = name;

  if (existing) {
    sendToSocket(session.socket, "Enter password:");
    session.state = "AUTH_PASSWORD";
    session.authAction = "login";
  } else {
    sendToSocket(session.socket, `Creating new character "${name}". Enter password (min 6 characters):`);
    session.state = "AUTH_PASSWORD";
    session.authAction = "register";
  }
}

async function handleAuthPassword(session: Session, input: string): Promise<void> {
  const password = input;
  const name = session.authName!;

  let result;
  if (session.authAction === "login") {
    result = await auth.login(name, password);
  } else {
    result = await auth.register(name, password);
  }

  if (!result.success) {
    sendToSocket(session.socket, `Failed: ${result.error}`);
    sendToSocket(session.socket, "Enter character name:");
    session.state = "AUTH_NAME";
    session.authName = undefined;
    session.authAction = undefined;
    return;
  }

  const character = result.character;
  const player = createPlayer(character, session.socket);
  session.player = player;
  session.state = "PLAYING";

  sendToSocket(session.socket, `Welcome, ${character.name}!`);
  await commands.handleInput(player, "look");
}

async function handleGameCommand(session: Session, input: string): Promise<void> {
  const player = session.player!;
  await commands.handleInput(player, input);
}

export function getPlayer(session: Session): Player | undefined {
  return session.player;
}
