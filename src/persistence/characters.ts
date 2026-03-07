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

let characterCache: Character[] | null = null;

// Exported for testing purposes if ever needed
export function clearCharacterCache() {
  characterCache = null;
}

async function loadCharacters(): Promise<Character[]> {
  if (characterCache !== null) {
    return characterCache;
  }
  try {
    const data = await fs.readFile(CHARACTERS_FILE, "utf-8");
    characterCache = JSON.parse(data);
    return characterCache!;
  } catch {
    characterCache = [];
    return characterCache;
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
