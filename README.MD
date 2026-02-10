# Solomon - Puzzle Game Platform

A full-stack web platform for creating, sharing, and playing puzzle games. Users can design their own levels, publish them to the community, and play puzzles created by others.

## Features

- **User Authentication**: Secure passwordless authentication using WebAuthn passkeys
- **Level Creation**: Create custom puzzle levels with an in-browser editor
- **Level Sharing**: Publish your levels for the community to play
- **Gameplay**: Play puzzles created by other users
- **Progress Tracking**: Track level completions and player statistics
- **Level Protection**: Published levels become locked after completion, preserving the creator's original design

## Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management
- **SQLite** - Lightweight database
- **JWT** - Token-based authentication
- **@simplewebauthn/server** - WebAuthn passkey implementation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React Router** - Client-side routing
- **@simplewebauthn/browser** - WebAuthn client implementation

### Infrastructure
- **Docker** - Single container deployment
- **Docker Compose** - Local development and deployment
- **GitHub Actions** - CI/CD pipeline

## Getting Started

### Prerequisites
- Node.js 22 or higher
- Docker and Docker Compose (for containerized deployment)

### Local Development

#### Server Development
```bash
cd server
npm install
npm run db:push          # Initialize database
npm run db:generate      # Generate Prisma client
npm run dev              # Start dev server with hot reload
```

#### Client Development
```bash
cd client
npm install
npm run dev              # Start Vite dev server (proxies API to localhost:3000)
```

The client dev server will be available at `http://localhost:5173` and will proxy API requests to the backend server.

### Docker Deployment

Build and run the entire application:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `JWT_SECRET` - Secret key for JWT token signing
- `DATABASE_URL` - SQLite database file path
- `RP_ID` - Relying Party ID for WebAuthn (domain)
- `RP_NAME` - Relying Party name for WebAuthn
- `RP_ORIGIN` - Full origin URL for WebAuthn
- `PORT` - Server port (default: 3000)

## Architecture

Solomon uses a monolithic architecture with separate client and server directories:

- **Single Container Deployment**: Express serves both the API (`/api/*`) and the compiled React SPA as static files
- **Database**: SQLite database persists via Docker volume
- **Authentication**: JWT tokens with WebAuthn passkey-based login
- **State Management**: React Context API for user authentication state

### Key Business Rules

- Levels progress through states: Draft → Published → Locked
- A published level becomes locked once any user completes it
- Locked levels cannot be edited or deleted (preserves original design)
- One completion per user per level (enforced by database constraint)

## Testing

The server uses Vitest and Supertest for integration testing:

```bash
cd server
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npx vitest run tests/levels.test.ts  # Run specific test file
```

Tests use an isolated SQLite test database and run sequentially to avoid conflicts.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register/options` - Get passkey registration options
- `POST /register/verify` - Verify registration and create user
- `POST /login/options` - Get passkey login options
- `POST /login/verify` - Verify login and return JWT
- `GET /me` - Get current user info (requires JWT)

### Levels (`/api/levels`)
- `GET /` - List published levels
- `POST /` - Create a new level (requires auth)
- `GET /:id` - Get level details
- `PUT /:id` - Update level (requires auth, must be creator)
- `DELETE /:id` - Delete level (requires auth, must be creator, cannot be locked)
- `POST /:id/publish` - Publish level (requires auth, must be creator)
- `POST /:id/complete` - Mark level as completed (requires auth)

### Users (`/api/users`)
- `GET /:username` - Get user profile and published levels
- `GET /:username/levels` - List user's levels (dashboard view, requires auth)

## Project Structure

```
solomon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API and auth services
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Application entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose configuration
└── .env.example          # Environment variable template
```

## Database Schema

- **User** - User accounts with passkey credentials
- **Credential** - WebAuthn credentials for passwordless auth
- **Level** - Puzzle levels with metadata and state
- **LevelCompletion** - Track which users completed which levels

## Contributing

This is a personal project by eugenioenko. Feel free to fork and experiment!

## License

See repository for license information.
