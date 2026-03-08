# AGENTS.md — Agentic Development Guidelines for NodeMUD

Welcome, agent. This document outlines the technical standards, architectural patterns, and development workflows for the `NodeMUD` project. Adhere strictly to these guidelines.

---

## 1. Project Context

`NodeMUD` is a text-based Multi-User Dungeon (MUD) built on raw TCP.
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript (Strict)
- **Networking**: `net` module (Raw TCP, telnet/nc compatible)
- **Persistence**: JSON files (`data/characters.json` and `data/world.json`)

---

## 2. Core Commands

### 2.1 Initialization & Build
- `npm install` — Install dependencies (`bcrypt`, `vitest`, `eslint`, etc.)
- `npx tsc` — Compile TypeScript
- `npx tsc --watch` — Type-check in watch mode

### 2.2 Testing (Vitest)
- `npm test` — Run all unit tests
- `npx vitest run tests/auth.test.ts` — Run a single test file
- `npx vitest run -t "should register"` — Run a specific test by name
- `npm test -- --watch` — Watch mode for TDD

### 2.3 Quality Control
- `npx eslint src` — Lint source code
- `npx eslint src --fix` — Auto-fix lint issues
- `npx prettier --write .` — Format codebase

---

## 3. Architecture & Constraints

Follow the three-layer separation defined in `ARCHITECTURE.md`.

### 3.1 Network Layer (`src/network/`)
- **Responsibility**: TCP server, socket lifecycle, buffer handling.
- **Constraint**: **Zero game logic**. Do not include authentication or movement logic here.
- **Validation**: Manual only (via `telnet` or `nc`).

### 3.2 Domain Layer (`src/domain/`)
- **Responsibility**: Game rules, room navigation, character logic, command parsing.
- **Constraint**: **Pure logic** or **Dependency Injection**. No direct file system access.
- **Requirement**: Must have 100% unit test coverage.

### 3.3 Persistence Layer (`src/persistence/`)
- **Responsibility**: JSON adapters for reading/writing characters and world data.
- **Constraint**: Simple wrappers. Mock these in domain tests.

---

## 4. Code Style Standards

### 4.1 TypeScript Usage
- Use **Node.js 20+** features.
- Set `strict: true` in `tsconfig.json`.
- Avoid `any`. Use interfaces for models and union types for directions.

### 4.2 Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `command-handler.ts`)
- **Interfaces/Types**: `PascalCase` (e.g., `interface Room`, `type Direction`)
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

### 4.3 Error Handling
- Game errors (e.g., "North is blocked") should return descriptive result objects, not throw exceptions.
- All user-facing error messages must be clear, textual, and sent over the socket.

---

## 5. Persistence Models

### 5.1 Directions
```typescript
type Direction = "north" | "south" | "east" | "west" | "up" | "down";
```

### 5.2 Room Structure
```typescript
interface Room {
  id: string;
  title: string;
  description: string;
  exits: Partial<Record<Direction, string>>;
}
```

---

## 6. Development Workflow (TDD)

1. **Test First**: Write tests in `tests/` for any new logic in the Domain Layer.
2. **Pure Implementation**: Implement logic in `src/domain/` without side effects.
3. **Mocking**: Mock `net.Socket` and persistence adapters during unit tests.
4. **Manual Integration**: Once domain tests pass, wire the logic to the Network Layer and verify manually using `nc localhost <port>`.

---

## 7. Interaction Rules

- **No Web Frameworks**: Do not add Express, Socket.io, or REST APIs.
- **Stateless Client**: All game state lives on the server.
- **Security**: Use `bcrypt` for password hashing. Never store plain text passwords.
- **Broadcast**: Use room-based broadcasting for movement and chat (`say`).

---

## 8. Git Conventions

- Commit style: `type(scope): description`
- Examples: `add(domain): room movement`, `fix(auth): hash validation`, `add(docs): update AGENTS.md`

---

*Note: This file is for agentic use. Keep it updated as the project evolves.*
