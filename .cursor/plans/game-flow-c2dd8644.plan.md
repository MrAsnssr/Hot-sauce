<!-- c2dd8644-7d01-43ff-a66c-313e6051943b fc8e218a-68d3-4676-abda-e7e0fa22c16a -->
# Game Flow Rework

## Summary

Rewrite game logic so that:

1. Team A picks subject
2. Team B picks question type  
3. Both teams see question and answer simultaneously
4. Correct teams get points; faster team gets bonus (online only)
5. Roles swap each round

## Changes

### 1. Online Game - Frontend (`frontend/src/pages/OnlineGamePage.tsx`)

**New phases:**

- `pick_subject` - Subject-picking team chooses
- `pick_type` - Type-picking team chooses  
- `question` - Both teams vote simultaneously
- `results` - Show answers and points

**New state:**

- `subjectPickerIndex` - Which team picks subject (alternates)
- `playerVotes` - Map of `{playerId: optionId}` for current user's team
- `teamAnswers` - `{teamId: {optionId, timestamp}}`
- `answerTimestamps` - Track when each team locked in answer

**Voting logic:**

- Each player clicks an option (emits `player-vote`)
- Once majority reached OR timer expires, team answer locks
- First player breaks ties

### 2. Online Game - Backend (`backend/src/sockets/gameSocket.ts`)

**New socket events:**

- `select-subject` - Host/subject-picker chooses subject
- `select-type` - Type-picker chooses question type
- `load-question` - Server fetches question, broadcasts to room
- `player-vote` - Player submits vote `{teamId, optionId}`
- `team-answer-locked` - Broadcast when team majority reached
- `reveal-results` - Show answers, calculate points

**Server tracks per room:**

- `currentPhase`
- `subjectPickerTeamId`
- `votes: {teamId: {playerId: optionId}}`
- `lockedAnswers: {teamId: {optionId, timestamp}}`

**Scoring:**

- Both correct teams get base points
- Faster correct team gets +5 bonus

### 3. Local Game - Frontend (`frontend/src/pages/LocalGamePage.tsx`)

**New phases:**

- `pick_subject` - Team A picks
- `pick_type` - Team B picks
- `answering` - Host picks answer for each team (existing but modified)
- `results` - Show results

**Changes:**

- Add question type selection step
- Host manually selects each team's answer (no voting, no speed bonus)
- Both teams can get points if correct

### 4. Question Types Data (`frontend/src/constants/questionTypes.ts`)

Already exists - verify it has the types needed for selection UI.

## File Changes Summary

| File | Change |
|------|--------|
| `frontend/src/pages/OnlineGamePage.tsx` | Full rewrite with new phases, voting, socket events |
| `frontend/src/pages/LocalGamePage.tsx` | Add question type selection phase |
| `backend/src/sockets/gameSocket.ts` | Add voting events, room state, scoring logic |

### To-dos

- [ ] Rewrite OnlineGamePage with subject/type picking, voting, and simultaneous answering
- [ ] Add socket events for voting, room state tracking, and scoring with speed bonus
- [ ] Add question type selection phase to LocalGamePage