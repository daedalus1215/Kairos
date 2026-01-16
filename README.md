```
 _  __     _               
| |/ /__ _(_)_ __ ___  ___ 
| ' // _` | | '__/ _ \/ __|
| . \ (_| | | | | (_) \__ \
|_|\_\__,_|_|_|  \___/|___/
```

# Kairos - Meeting Cost Calculator

> *"He has only a tuft of hair on his forehead, by which you can seize him when he comes; but once he has passed, not even Zeus can catch him from behind."*
> — Ancient Greek proverb about Kairos

## ⏳ The Mythology

**Kairos** (καιρός) is the ancient Greek god of the *opportune moment* — the fleeting instant when action becomes possible. Unlike his counterpart Chronos, who governs sequential, quantitative time (seconds, minutes, hours), Kairos embodies *qualitative* time: the right moment, the perfect timing, the window of opportunity.

In classical depictions, Kairos is shown:
- **Bald at the back of his head** — once he passes, you cannot grasp him
- **With a single lock of hair at his forehead** — you must seize him as he approaches  
- **Winged feet and shoulders** — he moves swiftly and waits for no one
- **Balancing on a razor's edge** — the opportune moment is precarious

This application is named Kairos because every moment in a meeting has value. Time, once spent, cannot be reclaimed. Like the god himself, if you miss the moment to end an unproductive meeting, that opportunity — and that money — is gone forever.

**Kairos isn't petty, but he is fickle with timing.** Miss him, and he doesn't come back.

---

A real-time meeting cost calculator that tracks participants, calculates running costs via WebSockets, and persists meeting data for historical analysis.

## Features

- **Real-time Cost Tracking**: Watch meeting costs tick up in real-time with animated displays
- **Participant Management**: Maintain a roster of team members with their hourly rates
- **WebSocket Updates**: Live cost updates pushed to all connected clients
- **Meeting History**: Search and browse past meetings with detailed breakdowns
- **Meeting Notes**: Add notes to meetings for post-meeting review
- **Beautiful UI**: "Quantum Glass" aesthetic with glassmorphism and electric accents

## Tech Stack

### Backend
- NestJS 11
- TypeORM with SQLite
- Socket.IO for WebSockets
- JWT Authentication
- Swagger API Documentation

### Frontend
- React 18
- Vite
- MUI (Material UI) 7
- TanStack Query
- Tailwind CSS
- Framer Motion for animations
- Socket.IO Client

## Architecture

The project follows Domain-Driven Design (DDD) with a layered architecture:

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── participants/   # Participant roster
│   ├── meetings/       # Meeting management & WebSocket
│   └── shared-kernel/  # Shared utilities & guards

frontend/
├── src/
│   ├── api/           # API clients
│   ├── auth/          # Auth context
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   └── router/        # Route configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
DATABASE=db.sqlite
JWT_SECRET=your-secret-key
COOKIE_KEY=your-cookie-key
NODE_ENV=development
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Participants
- `GET /participants` - List all participants
- `POST /participants` - Create participant
- `PUT /participants/:id` - Update participant
- `DELETE /participants/:id` - Delete participant

### Meetings
- `POST /meetings` - Start a new meeting
- `GET /meetings` - List all meetings
- `GET /meetings/active` - Get active meeting
- `GET /meetings/search?q=` - Search meetings
- `GET /meetings/:id` - Get meeting details
- `POST /meetings/:id/end` - End meeting
- `POST /meetings/:id/participants` - Add participant to meeting
- `DELETE /meetings/:id/participants/:participantId` - Remove participant

### Meeting Notes
- `GET /meetings/:id/notes` - Get meeting notes
- `POST /meetings/:id/notes` - Add note
- `PUT /meetings/:id/notes/:noteId` - Update note
- `DELETE /meetings/:id/notes/:noteId` - Delete note

## WebSocket Events

Connect to `/meetings` namespace with JWT token in auth.

### Client -> Server
- `meeting:join` - Join a meeting room
- `meeting:leave` - Leave a meeting room

### Server -> Client
- `meeting:cost:update` - Real-time cost updates (every second)
- `meeting:participant:add` - Participant added
- `meeting:participant:remove` - Participant removed
- `meeting:end` - Meeting ended

## License

MIT
