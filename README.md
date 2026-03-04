# Meu-MUD

A text-based Multi-User Dungeon (MUD) built on raw TCP.

## Overview

Meu-MUD is a classic MUD game server that accepts connections via telnet/netcat. Players can create characters, explore rooms, move between locations, and chat with other players in the same room.

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
node dist/server.js
```

Connect with: `telnet localhost 2323` or `nc localhost 2323`

## Commands

### Authentication
- Enter a character name to login or create a new character
- Enter password to complete authentication

### In-Game
| Command | Description |
|---------|-------------|
| `look` | Look around the current room |
| `north`/`south`/`east`/`west`/`up`/`down` | Move in a direction |
| `say <message>` | Say something to the room |
| `who` | Show your character name |
| `help` | Show available commands |
| `quit` | Disconnect from the game |

## Project Structure

```
src/
├── domain/           # Game logic (pure, testable)
│   ├── auth.ts      # Registration & login
│   ├── commands.ts  # Command parsing & execution
│   ├── player.ts    # Player utilities
│   ├── types.ts      # TypeScript interfaces
│   └── world.ts     # Room navigation
├── network/          # TCP networking
│   ├── server.ts    # TCP server
│   ├── session.ts   # Connection state machine
│   └── socket-handler.ts  # Buffer handling
├── persistence/     # Data storage
│   ├── characters.ts
│   └── world.ts
└── server.ts        # Entry point
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Lint
npm run lint

# Type-check
npx tsc
```

## Architecture

Follows a three-layer separation:
- **Network Layer**: TCP server, socket handling (zero game logic)
- **Domain Layer**: Game rules, command parsing (100% test coverage)
- **Persistence Layer**: JSON file adapters for characters and world data

## World Data

Rooms are defined in `data/world.json`. Default world includes:
- Starting Chamber (entry point)
- Stone Hallway
- Old Armory

## Port

Default port is 2323 (port 23 requires root privileges). Change in `src/server.ts`.
