# Product Requirements Document (PRD)

## Simple Text-Based Multi-User Dungeon (MUD)

### 1. Product Overview

The product is text-based Multi-User Dungeon (MUD). Users connect via a text interface, create or log into a character, and explore a shared virtual world through typed commands. All interactions occur through text input and output.

---

### 2. Goals

1. Provide a functional MUD experience.
2. Allow persistent characters with authentication.
3. Enable exploration of a connected world of rooms.
4. Support multiple simultaneous users.

Non-goals:

* Combat system
* NPC AI
* Inventory system
* Skills, stats, leveling
* Complex scripting engine
* Graphical interface

---

### 3. Target Users

* Players interested in classic text-based multiplayer games.
* Developers experimenting with multiplayer server architectures.
* Users accessing via terminal or telnet-compatible clients.

---

### 4. Core Features

#### 4.1 User Authentication

##### 4.1.1 Account Creation

* User selects a character name.
* User sets a password.
* Name must be unique.
* Password must be stored securely (hashed).

##### 4.1.2 Login

* User provides character name.
* User provides password.
* On success, session starts.
* On failure, clear error message.

##### 4.1.3 Session Rules

* One active session per character.
* If already logged in, login is denied or previous session terminated (implementation decision required).

---

#### 4.2 Character Model

Each character must include:

* Name
* Password hash
* Current room ID

No stats, attributes, inventory, or progression.

---

#### 4.3 World Model

The world consists of:

* Rooms
* Exits connecting rooms

##### 4.3.1 Room Requirements

Each room must contain:

* Unique ID
* Title
* Description
* List of exits (direction → target room)

Example of possible directions:

* north
* south
* east
* west
* up
* down

##### 4.3.2 Room Display Format

When a player enters a room, the system must display:

1. Room title
2. Room description
3. Available exits
4. Other players currently in the room (if any)

---

#### 4.4 Movement System

Players move by typing direction commands.

Example:

* `north`, `n`
* `south`, `s`

Requirements:

* Movement must validate exit existence.
* If exit exists → move player and render new room.
* If not → show error message.

No movement cost, no cooldown, no randomness.

---

#### 4.5 Communication

Minimal communication system required.

##### 4.5.1 Room Chat

Command:

* `say <message>`

Behavior:

* Message visible to all players in same room.
* Sender sees confirmation.

Format example:

* "<Player's Name> says: Hello"

No global chat.

---

#### 4.6 Basic Commands

Minimum required commands:

* `help` — shows available commands
* `look` — reprints current room description
* Movement directions (e.g., `north`)
* `say <message>`
* `exit` — disconnects from server
* `who` — lists online players

---

### 5. Multiplayer Behavior

* Multiple players may occupy the same room.
* When a player enters a room:

  * Other players in room are notified.
* When a player leaves:

  * Others are notified.

Example:

* "Lucas entrou na sala."
* "Lucas saiu para o norte."

---

### 6. Technical Constraints

* Text-only interface (TCP-based, e.g., telnet compatible).
* Stateless client; all state stored server-side.
* Persistent storage required for:

  * Characters
  * World structure (can be static file)
* Password hashing mandatory.

---

### 7. Data Persistence

Minimum persistence requirements:

* Character storage (file or database).
* World definition (JSON, YAML, or code-defined structure).

No runtime world editing in v1.

---

### 8. Error Handling

System must handle:

* Invalid command
* Invalid direction
* Authentication failure
* Duplicate character name
* Empty input

All error messages must be clear and textual.

---

### 9. Success Metrics

The system is considered successful when:

1. A user can create a character.
2. A user can log in.
3. Two users can log in simultaneously.
4. Users can move between rooms.
5. Users can see each other.
6. Users can communicate via room chat.
7. Characters persist across restarts.

---

### 10. Future Extensions (Not in v1)

* Inventory system
* Items
* Combat
* NPCs
* Persistence per room events
* Admin commands
* World builder interface
* Web client
