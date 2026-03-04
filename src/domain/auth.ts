import * as bcrypt from "bcrypt";
import { Character, AuthResult } from "./types";
import characterRepo from "../persistence/characters";

export async function register(
  name: string,
  password: string
): Promise<AuthResult> {
  if (!name || name.trim() === "") {
    return { success: false, error: "Character name is required" };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const existing = await characterRepo.findByName(name);
  if (existing) {
    return { success: false, error: "Character name already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const character: Character = {
    name,
    passwordHash,
    currentRoom: "start",
  };

  await characterRepo.save(character);

  return { success: true, character };
}

export async function login(
  name: string,
  password: string
): Promise<AuthResult> {
  const character = await characterRepo.findByName(name);

  if (!character) {
    return { success: false, error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(password, character.passwordHash);

  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  return { success: true, character };
}
