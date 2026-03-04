# Architecture — Simple Text-Based MUD

## Stack


| Layer       | Technology                       |
| ------------- | ---------------------------------- |
| Runtime     | Node.js (v20+)                   |
| Language    | TypeScript                       |
| Network     | `net` module (raw TCP, built-in) |
| Persistence | JSON files (characters + world)  |
| Testing     | Jest + ts-jest                   |
| Lint        | ESLint + Prettier                |

1. [](https://)No web frameworks. No Socket.io. No REST API.

Raw TCP protocol — natively compatible with telnet and `nc`.

---

## Folder Structure

```
mud/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── src/
│   ├── server.ts              # Entry point: creates and starts the TCP server
│   ├── network/
│   │   └── connection.ts      # Manages individual connections (read/write text)
│   ├── domain/
│   │   ├── auth.ts            # Authentication logic (register, login)
│   │   ├── world.ts           # Room and exit queries, player movement
│   │   ├── player.ts          # In-memory player state
│   │   └── commands.ts        # Command parsing and dispatch
│   └── persistence/
│       ├── characters.ts      # Read/write characters.json
│       └── world.ts           # Load world.json (read-only in v1)
├── data/
│   ├── characters.json        # Character persistence
│   └── world.json             # World definition
├── tests/
│   ├── auth.test.ts
│   ├── world.test.ts
│   ├── commands.test.ts
│   └── player.test.ts
├── tsconfig.json
├── package.json
└── AGENTS.md
```

---

## Layer Separation

### 1. Network Layer (`network/`)

Responsible **only** for:

- Accepting TCP connections
- Reading lines of text from the client
- Writing text back to the client

Contains no game logic. Not unit tested — validated manually via `nc` or telnet.

### 2. Domain Layer (`domain/`)

All game logic lives here. Functions are **pure** or use dependency injection — no direct file I/O.

This is the layer covered by tests.

Responsibilities:

- `auth.ts` — register and validate login (receives/returns data, does not read files directly)
- `world.ts` — query rooms, exits, move player
- `player.ts` — in-memory player state (current room, name, socket reference)
- `commands.ts` — parse and dispatch commands (`look`, `say`, `north`, `who`, etc.)

### 3. Persistence Layer (`persistence/`)

Simple adapters that read and write JSON. Mocked in tests.

---

## Connection Flow

```
Client (telnet / nc)
     │
     ▼
[TCP Server] — net.createServer()
     │
     ▼
[connection.ts] — reads line by line, calls commands.ts
     │
     ▼
[commands.ts] — identifies command, calls domain layer
     │
     ├─→ [auth.ts]        — login / account creation
     ├─→ [world.ts]       — movement, look
     ├─→ [player.ts]      — current player state
     └─→ broadcast()      — notifies other players in the room
```

---

## Authentication Flow

```
connected
  └─→ prompt for name
        └─→ name exists?
              ├─ YES → prompt password → validate hash → enter world
              └─ NO  → ask to register → prompt password → create → enter world
```

---

## Data Models

### `data/world.json`

```json
{
  "rooms": {
    "start": {
      "id": "start",
      "title": "Central Square",
      "description": "A wide square paved with ancient stones. The wind carries the smell of earth.",
      "exits": {
        "north": "tavern",
        "east": "forest_edge"
      }
    },
    "tavern": {
      "id": "tavern",
      "title": "The Wolf Tavern",
      "description": "Loud and warm. The smell of ale and smoke fills the air.",
      "exits": {
        "south": "start"
      }
    }
  }
}
```

### `data/characters.json`

```json
{
  "legolas": {
    "name": "legolas",
    "passwordHash": "$2b$10$...",
    "currentRoom": "start"
  }
}
```

### TypeScript Types

```typescript
type Direction = "north" | "south" | "east" | "west" | "up" | "down";

interface Room {
  id: string;
  title: string;
  description: string;
  exits: Partial<Record<Direction, string>>;
}

interface Character {
  name: string;
  passwordHash: string;
  currentRoom: string;
}

interface Player {
  character: Character;
  socket: net.Socket;
}
```

---

## Supported Commands (v1)


| Command     | Aliases | Description             |
| ------------- | --------- | ------------------------- |
| `look`      | `l`     | Display current room    |
| `north`     | `n`     | Move north              |
| `south`     | `s`     | Move south              |
| `east`      | `e`     | Move east               |
| `west`      | `w`     | Move west               |
| `up`        | `u`     | Move up                 |
| `down`      | `d`     | Move down               |
| `say <msg>` | —      | Speak in current room   |
| `who`       | —      | List online players     |
| `help`      | —      | List available commands |
| `exit`      | `quit`  | Disconnect              |

---

## Testing Strategy (TDD)

Write the test **before** the implementation for all domain logic.

Suggested order:

1. `auth.test.ts` — register account, correct login, wrong login, duplicate name
2. `world.test.ts` — load rooms, query exits, move player
3. `commands.test.ts` — command parsing, correct dispatch, invalid commands
4. `player.test.ts` — player state, room broadcast

The network layer is **not** unit tested. Integration is validated manually via `nc` or telnet.

---

## Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-jest": "^29.0.0",
    "jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

Only `bcrypt` as a production dependency. Everything else is Node built-in or dev tooling.

---

## Design Decisions


| Decision                     | Choice          | Reason                                             |
| ------------------------------ | ----------------- | ---------------------------------------------------- |
| Protocol                     | Raw TCP         | Telnet compatible, zero overhead                   |
| Framework                    | None            | A simple MUD does not need Express or Fastify      |
| WebSocket / Socket.io        | ❌ No           | Not compatible with telnet clients                 |
| REST API                     | ❌ No           | Connection-oriented protocol, not request/response |
| Database                     | JSON files      | Simple, no external dependency, sufficient for v1  |
| Single session per character | Yes             | Second login is blocked while character is online  |
| Stats / combat / inventory   | ❌ Out of scope | Per PRD v1                                         |
