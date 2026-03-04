import { Character } from "../domain/types";
import * as fs from "fs/promises";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../../data");
const CHARACTERS_FILE = path.join(DATA_DIR, "characters.json");

export interface CharacterRepository {
  findByName(name: string): Promise<Character | null>;
  save(character: Character): Promise<void>;
  findAll(): Promise<Character[]>;
}

async function loadCharacters(): Promise<Character[]> {
  try {
    const data = await fs.readFile(CHARACTERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCharacters(characters: Character[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
}

const characterRepo: CharacterRepository = {
  async findByName(name: string): Promise<Character | null> {
    const characters = await loadCharacters();
    return characters.find((c) => c.name === name) || null;
  },

  async save(character: Character): Promise<void> {
    const characters = await loadCharacters();
    const existing = characters.findIndex((c) => c.name === character.name);

    if (existing >= 0) {
      characters[existing] = character;
    } else {
      characters.push(character);
    }

    await saveCharacters(characters);
  },

  async findAll(): Promise<Character[]> {
    return loadCharacters();
  },
};

export default characterRepo;
