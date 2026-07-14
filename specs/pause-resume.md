# Kairos — Pause / Resume Specification

## Context

Kairos is a real-time meeting cost calculator (NestJS + React/Vite, Socket.IO, SQLite).
Current lifecycle: `start` -> `active` (cost ticking every second) -> `end`.
There is no way to pause a meeting. Once started, costs tick continuously until
`end` is called.

## Goal

Allow the meeting creator to pause and resume an active meeting. During pause:
- The cost clock freezes. No cost accrues.
- Participants stay in the meeting room.
- The WebSocket connection stays alive.
- New participants can be added as "pending" — they are not persisted until resume.
- The meeting can still be ended while paused.

## Design: Option A — Freeze Elapsed Time (Single Continuity)

The meeting keeps one continuous `startTime` -> `endTime`. Pause records how much
time was frozen. On resume, the cost interval restarts.

```
totalElapsed = (now - startTime) - totalPausedSeconds
```

This is Option A from the design discussion. We do NOT split into segments.

---

## Data Model Changes

### Meeting Entity — New Columns

| Column               | Type                | Nullable | Default | Note                         |
|----------------------|---------------------|----------|---------|------------------------------|
| `paused_at`          | `datetime`          | Yes      | NULL    | Non-null when currently paused |
| `total_paused_seconds` | `int`             | No       | 0       | Cumulative seconds across all pause/resume cycles |

- `paused_at` is non-null when the meeting is currently paused.
- `total_paused_seconds` accumulates across all pause/resume cycles in a single meeting.
- Both persist to SQLite — survives server restarts.

**Migration:** Add columns to the existing `meetings` table. TypeORM handles auto-migration
with `synchronize: true` in dev; a migration file for production.

### Cost Calculation Change

**Current formula** in `calculate-meeting-cost-ts`:
```
elapsedSeconds = Math.floor((now - startTime) / 1000)
```

**New formula:**
```
elapsedSeconds = Math.floor((now - startTime) / 1000) - totalPausedSeconds
```

The cost script also checks: only tick when `meeting.status === 'active'` AND
`meeting.pausedAt === null`. A paused meeting returns `null` (no tick).

---

## Backend — New Transaction Scripts

### PauseMeetingTransactionScript

**Location:** `backend/src/meetings/domain/transaction-scripts/pause-meeting-ts/pause-meeting.transaction.script.ts`

**Input:** `meetingId`, `userId`

**Guards:**
- Meeting exists
- `meeting.userId === userId` (creator only)
- `meeting.status === 'active'`
- `meeting.pausedAt === null` (not already paused)

**Action:**
- Set `pausedAt = new Date()`
- Persist to DB
- Stop WebSocket cost interval for this meeting (via gateway)
- Broadcast `meeting:pause` event

**Returns:** `{ meetingId, pausedAt, totalPausedSeconds, totalCost, elapsedSeconds }`

### ResumeMeetingTransactionScript

**Location:** `backend/src/meetings/domain/transaction-scripts/resume-meeting-ts/resume-meeting.transaction.script.ts`

**Input:** `meetingId`, `userId`

**Guards:**
- Meeting exists
- `meeting.userId === userId` (creator only)
- `meeting.status === 'active'`
- `meeting.pausedAt !== null` (is actually paused)

**Action:**
- `pausedDuration = Math.floor((now - pausedAt) / 1000)`
- `totalPausedSeconds += pausedDuration`
- Set `pausedAt = null`
- Persist `totalPausedSeconds` to DB
- Flush pending participants (see below) with `joinedAt = now`
- Restart WebSocket cost interval for this meeting (via gateway)
- Broadcast `meeting:resume` event

**Returns:** `{ meetingId, resumedAt, totalPausedSeconds, totalCost, elapsedSeconds }`

---

## Backend — Meeting Service Changes

### New Methods on MeetingService

```typescript
pauseMeeting(meetingId: number, userId: number): Promise<MeetingPauseDto>
resumeMeeting(meetingId: number, userId: number): Promise<MeetingResumeDto>
```

Each delegates to its transaction script and returns the DTO.

### AddParticipant Behavior During Pause

When `addParticipant` is called on a paused meeting:
- Check `meeting.pausedAt !== null`
- If paused: queue the participant in an in-memory `pendingParticipants` Map
  (`Map<meetingId, PendingParticipant[]>`) in the gateway. Do NOT persist to DB.
- Broadcast `meeting:participant:pending` to clients.
- If not paused: existing behavior (persist immediately).

When `resumeMeeting` is called:
- Flush `pendingParticipants` for this meeting to `meeting_participants` table
  with `joinedAt = resume timestamp`.
- Clear the pending queue.

When `endMeeting` is called while paused:
- Discard `pendingParticipants` — they never joined.
- Normal end flow proceeds. `totalPausedSeconds` is preserved in the meeting record.

### findActiveMeeting Guard

A paused meeting still counts as "active" for the guard in `startMeetingTS`.
A user cannot start a second meeting while one is paused.

---

## Backend — MeetingsGateway Changes

### New WebSocket Events

```
Client -> Server:
  meeting:pause    — { meetingId: number }
  meeting:resume   — { meetingId: number }

Server -> Client:
  meeting:pause    — MeetingPauseDto
  meeting:resume   — MeetingResumeDto
  meeting:participant:pending — MeetingPendingParticipantDto
```

### Interval Management

**On pause:**
- `clearInterval` for this meeting's cost calculation
- Remove from `activeMeetings` Map
- Meeting state persisted to DB (`pausedAt`, `totalPausedSeconds`)

**On resume:**
- `setInterval` for cost calculation (same 1-second interval)
- Add back to `activeMeetings` Map
- `pausedAt` cleared, `totalPausedSeconds` updated in DB

**Why stop/restart the interval (vs keep running and skip):**
- Zero CPU/DB writes during pause
- Clean `activeMeetings` map
- Resume is just a `setInterval` — no complex reconciliation
- Server restart recovery is a one-time DB query at startup (acceptable cost)

### Pending Participants Storage

```typescript
// In MeetingsGateway
private pendingParticipants = new Map<number, PendingParticipant[]>();
```

- Populated when `addParticipant` is called on a paused meeting.
- Flushed to DB on resume.
- Discarded on end or server restart.

### Server Restart Recovery

On gateway initialization (or on `meeting:join`):

1. Query all meetings where `status = 'active'`.
2. For each meeting with `pausedAt !== null`:
   - Do NOT start a cost interval.
   - Store in a `pausedMeetings` Map for resume lookup.
3. For each meeting with `pausedAt === null`:
   - Start the cost interval as usual.

Pending participants are lost on restart. This is acceptable — the meeting was
paused, nothing was committed. Users can re-add participants after restart.

---

## Backend — New REST Endpoints

```
POST /meetings/:id/pause   — Pause meeting (JWT, meeting creator only)
POST /meetings/:id/resume  — Resume meeting (JWT, meeting creator only)
```

These call the same service methods as the WebSocket handlers. They exist for
API clients and are also usable from the frontend as a fallback.

**Action classes:**
- `PauseMeetingAction` -> `POST /meetings/:id/pause`
- `ResumeMeetingAction` -> `POST /meetings/:id/resume`

---

## Response DTOs

### New DTOs

```typescript
interface MeetingPauseDto {
  meetingId: number;
  pausedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
}

interface MeetingResumeDto {
  meetingId: number;
  resumedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
}

interface MeetingPendingParticipantDto {
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
}
```

### Existing DTO Changes

**MeetingResponseDto** gains two fields:
```typescript
pausedAt: Date | null;
totalPausedSeconds: number;
```

This lets the frontend know the initial pause state on page load/refresh.

---

## Frontend — ActiveMeetingPage Changes

### New State

```typescript
const [isPaused, setIsPaused] = useState(false);
const [pausedAt, setPausedAt] = useState<Date | null>(null);
const [pendingParticipants, setPendingParticipants] = useState<Participant[]>([]);
```

### New WebSocket Handlers

```typescript
onPause: (data: MeetingPauseDto) => {
  setIsPaused(true);
  setPausedAt(new Date(data.pausedAt));
  // Timer and cost freeze naturally — no more cost:update events.
}

onResume: (data: MeetingResumeDto) => {
  setIsPaused(false);
  setPausedAt(null);
  setPendingParticipants([]);
  // Timer and cost resume ticking via normal cost updates.
}

onParticipantPending: (data: MeetingPendingParticipantDto) => {
  setPendingParticipants(prev => [...prev, data]);
}
```

### UI Changes

#### 1. Pause Overlay on Cost/Timer Card

When `isPaused === true`, render a semi-transparent dark overlay on the
`GlassCard` containing the timer and cost display:

- Centered text: **"PAUSED"** with a large pause icon (two vertical bars,
  `PausePresentationIcon` from MUI).
- The frozen timer and cost remain visible underneath, dimmed (opacity ~0.4).
- Overlay uses `framer-motion` for a smooth fade-in/out transition.

#### 2. Button Swap

Replace the single "End Meeting" button with:

- **"Resume"** button (primary variant, accent color `#00F5FF`) — calls
  `meetingsApi.resume(meetingId)`. Only visible when `isPaused === true`.
- **"End Meeting"** button (error variant) — remains visible at all times,
  including during pause.

When not paused, only "End Meeting" is shown (existing behavior).

#### 3. Live Indicator

Change the connection indicator dot:
- Green "Live" when connected and not paused (existing)
- **Amber/yellow "Paused"** when `isPaused === true`
- Red "Connecting..." when not connected (existing)

#### 4. Pending Participants Section

When `pendingParticipants.length > 0`, render a section between active
participants and the "Add Participant" button:

- Header: "Pending (will join on resume)"
- Each pending participant shown as a `ParticipantCard` with `isActive={false}`
  and a "PENDING" badge.
- No cost ticking for pending participants.
- Section disappears on resume (participants become active).

#### 5. Add Participant Behavior During Pause

The "Add Participant" dialog remains enabled during pause. Clicking a participant
calls the existing `addParticipant` API. The backend queues it as pending and
broadcasts `meeting:participant:pending`. The frontend shows it in the pending
section.

### Timer Component

No changes needed. The timer receives `elapsedSeconds` as a prop. During pause,
the WebSocket stops sending `cost:update` events, so `elapsedSeconds` freezes
naturally. On resume, updates resume with the corrected elapsed time.

### New API Methods

```typescript
// meetings.api.ts
pause(meetingId: number): Promise<MeetingPauseDto>
resume(meetingId: number): Promise<MeetingResumeDto>
```

### Type Updates

```typescript
// types.ts
interface Meeting {
  // ... existing fields
  pausedAt: Date | null;
  totalPausedSeconds: number;
}

interface MeetingCostUpdate {
  meetingId: number;
  totalCost: number;
  elapsedSeconds: number;
  participants: { participantId: number; costContribution: number }[];
  // No change needed — backend already sends this shape.
}
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Resume called when not paused | 400 Bad Request: "Meeting is not paused" |
| Pause called when already paused | 400 Bad Request: "Meeting is already paused" |
| End meeting while paused | Normal end flow. `totalPausedSeconds` preserved. Pending participants discarded. |
| Server restart while paused | `pausedMeetings` Map rebuilt from DB query. No cost interval started. Resume works after restart. |
| Server restart while active | Cost interval restarted on next `meeting:join`. `totalPausedSeconds` already persisted. |
| Add participant while paused | Queued as pending in-memory. Saved to DB on resume. Discarded on end or server restart. |
| Remove participant while paused | Works normally on already-active participants. |
| Multiple pause/resume cycles | `totalPausedSeconds` accumulates. Cost formula subtracts the total. |
| Page refresh while paused | Frontend loads meeting via REST API, sees `pausedAt !== null`, sets `isPaused = true`. WebSocket reconnects, sees paused state, no interval started. |
| Two clients, one pauses, other sees it | `meeting:pause` broadcast reaches all clients in the room. Both show paused state. |

---

## File Change Summary

### Backend — New Files

```
backend/src/meetings/domain/transaction-scripts/pause-meeting-ts/pause-meeting.transaction.script.ts
backend/src/meetings/domain/transaction-scripts/resume-meeting-ts/resume-meeting.transaction.script.ts
backend/src/meetings/apps/actions/pause-meeting-action/pause-meeting.action.ts
backend/src/meetings/apps/actions/resume-meeting-action/resume-meeting.action.ts
```

### Backend — Modified Files

```
backend/src/meetings/domain/entities/meeting.entity.ts          — pausedAt, totalPausedSeconds columns
backend/src/meetings/domain/transaction-scripts/calculate-meeting-cost-ts/calculate-meeting-cost.transaction.script.ts — subtract totalPausedSeconds, skip when paused
backend/src/meetings/domain/transaction-scripts/end-meeting-ts/end-meeting.transaction.script.ts — discard pending participants on end while paused
backend/src/meetings/domain/services/meeting.service.ts         — pauseMeeting, resumeMeeting methods
backend/src/meetings/apps/gateways/meetings.gateway.ts          — pause/resume WS handlers, pending participants, interval management, restart recovery
backend/src/meetings/apps/dtos/responses/meeting-response.dto.ts — new DTOs + MeetingResponseDto fields
backend/src/meetings/meetings.module.ts                          — import new transaction scripts and actions
```

### Frontend — Modified Files

```
frontend/src/api/types.ts                                        — Meeting fields, new DTO types
frontend/src/api/meetings.api.ts                                 — pause(), resume() methods
frontend/src/hooks/useMeetingWebSocket.ts                         — onPause, onResume, onParticipantPending handlers
frontend/src/pages/ActiveMeetingPage/ActiveMeetingPage.tsx       — pause state, UI overlay, button swap, pending section
```

---

## Acceptance Criteria

1. Meeting creator can pause an active meeting via WebSocket or REST API.
2. Cost calculation stops immediately on pause. No cost accrues during pause.
3. Participants remain in the meeting room during pause.
4. WebSocket connection stays alive during pause.
5. New participants added during pause are shown as "pending" and not persisted.
6. On resume, pending participants are flushed to DB with `joinedAt = resume time`.
7. On resume, cost calculation restarts with corrected elapsed time.
8. Multiple pause/resume cycles correctly accumulate `totalPausedSeconds`.
9. Ending a paused meeting works normally; pending participants are discarded.
10. Server restart while paused preserves pause state; resume works after restart.
11. Page refresh while paused restores paused UI state.
12. A paused meeting blocks starting a new meeting (existing guard).
13. Frontend shows a clear "PAUSED" overlay on the cost/timer card.
14. Frontend swaps "End Meeting" for "Resume" + "End Meeting" during pause.
15. Frontend shows pending participants in a dedicated section.
