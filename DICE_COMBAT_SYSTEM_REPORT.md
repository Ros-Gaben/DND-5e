# Dice Rolling & Combat System - Full Test Report

## Executive Summary

This report provides a comprehensive analysis of the dice rolling and combat systems after the Phase 1-4 fixes. It documents the new architecture, compares it to the old system, and simulates a complete combat encounter with 2 goblins.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DICE ROLLING FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   Player Action                                                                      │
│       ↓                                                                              │
│   handleSubmit (Game.tsx:522)                                                        │
│       ↓                                                                              │
│   sendChatMessage (chatService.ts)                                                   │
│       ↓                                                                              │
│   Edge Function (chat/index.ts)                                                      │
│       │                                                                              │
│       │  AI generates response with:                                                 │
│       │  [ROLL_REQUEST:type]{...}[/ROLL_REQUEST]                                     │
│       ↓                                                                              │
│   parseRollRequests (rollRequestParser.ts:73)                                        │
│       ↓                                                                              │
│   setRollRequestQueue(rollRequests) (Game.tsx:596)                                   │
│       ↓                                                                              │
│   pendingRollRequest = rollRequestQueue[0] (Game.tsx:126)                            │
│       ↓                                                                              │
│   ContextDiceRoller receives pendingRollRequest                                      │
│       ↓                                                                              │
│   Dice button ENABLED (isRollEnabled returns true)                                   │
│       ↓                                                                              │
│   Player clicks button → executeRoll (ContextDiceRoller.tsx:217)                     │
│       ↓                                                                              │
│   onRollComplete callback → handleDirectSendRoll (Game.tsx:652)                      │
│       ↓                                                                              │
│   completeCurrentRoll() removes first item from queue (Game.tsx:189)                 │
│       ↓                                                                              │
│   Roll result sent to AI → cycle continues                                           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Combat Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMBAT FLOW (NEW SYSTEM)                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   STEP 1: AI initiates combat                                                        │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │ [COMBAT:start_combat]{}[/COMBAT]                                               │ │
│   │ [ROLL_REQUEST:initiative]{}[/ROLL_REQUEST]                                     │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│       ↓                                                                              │
│   Combat tracker opens, initiative button enabled                                    │
│       ↓                                                                              │
│   STEP 2: Player rolls initiative (e.g., gets 15)                                    │
│   Player sends: "Initiative: 15 (12+3)"                                              │
│       ↓                                                                              │
│   STEP 3: AI adds player with actual initiative                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │ [COMBAT:add_player]{"initiative": 15}[/COMBAT]                                 │ │
│   │ [COMBAT:add_combatant]{"name": "Goblin", "count": 2}[/COMBAT]                  │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│       ↓                                                                              │
│   processCombatCommand handles add_player (combatCommands.ts:121)                    │
│   processCombatCommand handles add_combatant (combatCommands.ts:147)                 │
│       ↓                                                                              │
│   Combat tracker shows: Player (init 15), Goblin 1 (init X), Goblin 2 (init Y)       │
│       ↓                                                                              │
│   STEP 4: Combat proceeds with turn-by-turn actions                                  │
│       ↓                                                                              │
│   HP sync: [COMBAT:damage] on player → onPlayerHPSync callback → character updated  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
### 2 Roll Request Queue System (NEW)

**How it works:**
1. AI sends response with one or more `[ROLL_REQUEST]` tags
2. `parseRollRequests()` extracts ALL requests into an array
3. All requests are added to `rollRequestQueue` (Game.tsx:596)
4. `pendingRollRequest` always shows the FIRST item in queue
5. When player completes a roll, `completeCurrentRoll()` removes the first item
6. If more requests remain, the next one becomes active

**OLD system comparison:**
```typescript
// OLD - Single pending request, easily overwritten or lost
const [pendingRollRequest, setPendingRollRequest] = useState<ParsedRollRequest | null>(null);
// Would get cleared on ANY AI response, even if roll wasn't done
```



**Called from:** `handleDirectSendRoll` (Game.tsx:659)

Ensures rolls are only cleared when player actually sends the result to chat.

## 3. SIMULATED COMBAT TEST: 2 GOBLINS

### 3.1 Test Scenario

**Player:** Level 3 Fighter named "Aldric"
- HP: 28/28, AC: 16
- Weapon: Longsword (equipped)
- DEX: +1, STR: +3

**Enemies:** 2 Goblins
- HP: 7 each, AC: 15
- Initiative bonus: +2

### 3.2 Complete Combat Flow

#### Phase 1: Combat Initiation

**Player:** "I attack the goblins!"

**Expected AI Response:**
```
The two goblins hiss and draw their scimitars!

Roll for initiative!

[COMBAT:start_combat]{}[/COMBAT]
[ROLL_REQUEST:initiative]{}[/ROLL_REQUEST]
```

**System Behavior:**
| Step | Code Location | Action |
|------|---------------|--------|
| 1 | Game.tsx:576 | `parseCombatCommands` extracts `start_combat` |
| 2 | combatCommands.ts:110 | `isInCombat = true`, player NOT added |
| 3 | Game.tsx:593 | `parseRollRequests` extracts initiative |
| 4 | Game.tsx:596 | `rollRequestQueue = [{type: "initiative"}]` |
| 5 | ContextDiceRoller.tsx:199 | Initiative button ENABLED |

**Player rolls:** 15 (12 + 3)
**Player sends:** "Initiative: 15 (12+3)"

**Expected AI Response:**
```
You react quickly! Goblin 1 rolls 14, Goblin 2 rolls 9.

Turn order: Aldric (15), Goblin 1 (14), Goblin 2 (9)

It's your turn!

[COMBAT:add_player]{"initiative": 15}[/COMBAT]
[COMBAT:add_combatant]{"name": "Goblin", "count": 2}[/COMBAT]
```

**System Behavior:**
| Step | Code Location | Action |
|------|---------------|--------|
| 1 | combatCommands.ts:121 | `add_player` creates player with initiative 15 |
| 2 | combatCommands.ts:147 | `add_combatant` creates Goblin 1 & 2 |
| 3 | combatCommands.ts:169 | `sortByInitiative` orders combatants |
| 4 | DMCombatTracker | Shows sorted turn order |

#### Phase 2: Player Attack

**Player:** "I swing my longsword at Goblin 1!"

**Expected AI Response:**
```
You raise your longsword toward Goblin 1!

Make your attack roll!

[ROLL_REQUEST:attack]{"weapon": "Longsword"}[/ROLL_REQUEST]
```

**System Behavior:**
| Step | Action |
|------|--------|
| 1 | `rollRequestQueue = [{type: "attack", weapon: "Longsword"}]` |
| 2 | Attack button ENABLED, shows "Attack Roll (Longsword)" |
| 3 | `isRollEnabled("attack", {weapon: "Longsword"})` returns true |

**Player rolls:** 18 (15 + 3)
**Player sends:** "Attack Roll: 18 (15+3) with Longsword"

**Expected AI Response (hit against AC 15):**
```
Your blade finds its mark!

Roll for damage!

[ROLL_REQUEST:damage]{"weapon": "Longsword", "critical": false}[/ROLL_REQUEST]
```

**Player rolls:** 9 (6 + 3)
**Player sends:** "Damage: 9 (6+3) from Longsword"

**Expected AI Response:**
```
Your longsword cleaves into Goblin 1! The creature collapses, defeated!

[COMBAT:damage]{"target": "Goblin 1", "amount": 9}[/COMBAT]

Goblin 2 snarls and attacks!

[COMBAT:next_turn]{}[/COMBAT]
```

**System Behavior:**
| Step | Code Location | Action |
|------|---------------|--------|
| 1 | combatCommands.ts:187 | `damage` command sets Goblin 1 HP to 0 |
| 2 | combatCommands.ts:251 | `next_turn` advances to Goblin 2 |

#### Phase 3: Goblin Attacks Player

**AI narrates:**
```
Goblin 2 slashes at you! The goblin rolls 17 vs your AC 16 - it hits!

The scimitar cuts your arm for 5 damage!

[COMBAT:damage]{"target": "Aldric", "amount": 5}[/COMBAT]

It's your turn again!

[COMBAT:next_turn]{}[/COMBAT]
```

**System Behavior (HP SYNC):**
| Step | Code Location | Action |
|------|---------------|--------|
| 1 | combatCommands.ts:192 | Target is player (isPlayer = true) |
| 2 | combatCommands.ts:196 | `onPlayerHPSync(23)` called |
| 3 | Game.tsx:184 | `handleCombatHPSync(23)` |
| 4 | Game.tsx:155 | `handlePlayerHPChange(23)` |
| 5 | Game.tsx:161 | Database updated: `hit_points = 23` |
| 6 | Game.tsx:172 | Character state updated |
| 7 | Game.tsx:175 | Combat tracker updated |

**Result:** All three HP sources synchronized to 23!

#### Phase 4: Player Finishes Combat

**Player:** "I attack Goblin 2!"

*(Same flow: attack request → roll → damage request → roll)*

**Final AI Response:**
```
Your blade strikes true! The second goblin falls!

Combat ends. You are victorious!

[COMBAT:damage]{"target": "Goblin 2", "amount": 8}[/COMBAT]
[COMBAT:end_combat]{}[/COMBAT]
[XP_AWARD]{"amount": 50, "reason": "Defeating 2 goblins"}[/XP_AWARD]
```

---

## 4. COMPARISON: OLD vs NEW SYSTEM

### 4.1 Roll Request Handling

| Aspect | OLD System | NEW System |
|--------|-----------|------------|
| Storage | Single `pendingRollRequest` | Queue array `rollRequestQueue` |
| Multiple requests | Only last one kept | All stored, processed in order |
| Clearing | Cleared on any AI response | Only cleared when roll sent |
| Persistence | Lost immediately | Persists until completed |

### 4.2 Initiative Flow

| Aspect | OLD System | NEW System |
|--------|-----------|------------|
| Player addition | Auto on `start_combat` | Explicit via `add_player` |
| Initiative value | Random (1-20) | Actual player roll |
| AI instructions | Basic | Explicit 3-step flow |

### 4.3 HP Synchronization

| Aspect | OLD System | NEW System |
|--------|-----------|------------|
| Combat damage | Only updated combatant | Updates combatant + character + DB |
| HP sources | 2 separate, unsync'd | Unified via callback |
| Database | Not updated | Auto-saved on change |

### 4.4 Weapon Matching

| Aspect | OLD System | NEW System |
|--------|-----------|------------|
| Name matching | Exact only | Fuzzy + prefix stripping |
| Unknown weapons | Returns null | Falls back to 1d6 |
| Examples | "Iron Longsword" fails | "Iron Longsword" → "Longsword" |

---
