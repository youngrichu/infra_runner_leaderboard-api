# Leaderboard API

A realtime leaderboard API for the Infrastructure Runner game, built with Fastify, Supabase, and Socket.IO.

## Features

- **Realtime Updates**: Live leaderboard updates using Socket.IO
- **Score Submission**: Submit player scores with detailed game metrics
- **Multiple Leaderboards**: Overall, organization-based, and recent scores
- **Player Statistics**: Track individual player progress
- **Game Analytics**: Comprehensive game statistics and metrics
- **API Documentation**: Auto-generated Swagger documentation

## Tech Stack

- **Framework**: Fastify
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Socket.IO
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account and project

### Installation

1. Clone and navigate to the API directory:
```bash
cd leaderboard-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3001
NODE_ENV=development
```

5. Set up the database schema:
   - Log into your Supabase dashboard
   - Go to SQL Editor
   - Run the SQL script from `database/schema.sql`

### Development

Start the development server:
```bash
pnpm run dev
```

The API will be available at `http://localhost:3001`

## API Documentation

Once the server is running, visit `http://localhost:3001/docs` for interactive API documentation.

## API Endpoints

### Leaderboard

- `POST /api/leaderboard/submit` - Submit a new score
- `GET /api/leaderboard/top` - Get top scores
- `GET /api/leaderboard/player/:email` - Get player's best score
- `GET /api/leaderboard/organization/:organizationName` - Get organization leaderboard
- `GET /api/leaderboard/recent` - Get recent scores
- `GET /api/leaderboard/statistics` - Get game statistics

### Health

- `GET /health` - Health check
- `GET /ready` - Readiness check

## Data Structure

### Score Submission

```json
{
  "playerName": "John Doe",
  "email": "john@example.com",
  "organizationName": "ACME Corp",
  "score": 1500,
  "gameDuration": 120,
  "blueprintsCollected": 5,
  "waterDropsCollected": 8,
  "energyCellsCollected": 3
}
```

### Response Format

```json
{
  "success": true,
  "data": { /* result data */ },
  "message": "Success message"
}
```

## Realtime Events

The API emits Socket.IO events for realtime updates:

- `scoreSubmitted` - When a new score is submitted
- `leaderboardUpdated` - When the leaderboard changes

### Client Example

```javascript
const socket = io('http://localhost:3001');

socket.on('scoreSubmitted', (data) => {
  console.log('New score submitted:', data);
});

socket.on('leaderboardUpdated', (leaderboard) => {
  console.log('Leaderboard updated:', leaderboard);
});
```

## Database Schema

The API uses a PostgreSQL database with the following main table:

```sql
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    game_duration INTEGER NOT NULL,
    blueprints_collected INTEGER NOT NULL,
    water_drops_collected INTEGER NOT NULL,
    energy_cells_collected INTEGER NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Deployment

### Environment Variables

Ensure all environment variables are set in your production environment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `PORT`
- `NODE_ENV`

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t leaderboard-api .
```

2. Run the container:
```bash
docker run -p 3001:3001 --env-file .env leaderboard-api
```

### Production Considerations

- Enable rate limiting (already configured)
- Set up monitoring and logging
- Configure CORS for your frontend domain
- Set up SSL/TLS termination
- Consider using a reverse proxy (nginx)

## Testing

Run tests:
```bash
pnpm test
```

## Security

- Input validation using Joi
- Rate limiting enabled
- CORS configured
- Helmet for security headers
- Row Level Security (RLS) enabled in Supabase

## License

MIT