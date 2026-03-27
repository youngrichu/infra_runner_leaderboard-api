const fastify = require('fastify')({ logger: true });
const { Server } = require('socket.io');
const LeaderboardModel = require('./models/leaderboard');
require('dotenv').config();

// Setup Socket.IO variable to be accessible in routes
let io;

// Define allowed origins for CORS
const isProduction = process.env.NODE_ENV === 'production';

let allowedOrigins;
if (process.env.FRONTEND_URL) {
  allowedOrigins = process.env.FRONTEND_URL.split(',');
  console.log('CORS: Using origins from FRONTEND_URL environment variable.');
} else {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'https://infra-runner.onrender.com', 'https://infra-runner.netlify.app'];
  if (isProduction) {
    console.error('CRITICAL CONFIGURATION WARNING: FRONTEND_URL environment variable is NOT set in production.');
    console.warn('Falling back to default staging/development origins. This may cause CORS issues for your production game.');
  } else {
    console.warn('WARNING: FRONTEND_URL is not set. Defaulting to standard development origins.');
  }
  allowedOrigins = defaultOrigins;
}

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin '${origin}' is not allowed`), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

fastify.register(require('@fastify/helmet'));

fastify.register(require('@fastify/rate-limit'), {
  global: true,
  max: 100, // global rate limit
  timeWindow: '1 minute'
});

fastify.register(require('@fastify/swagger'), {
  swagger: {
    info: {
      title: 'Leaderboard API',
      description: 'Realtime leaderboard API for Infrastructure Runner',
      version: '1.0.0'
    },
    consumes: ['application/json'],
    produces: ['application/json']
  }
});

fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// Decorate fastify with io getter before starting server
fastify.decorate('io', {
  getter() {
    return io;
  }
});

// Add root route
fastify.get('/', async (request, reply) => {
  return { message: 'Leaderboard API is running!', docs: '/docs' };
});

// Register routes
fastify.register(require('./routes/leaderboard'));
fastify.register(require('./routes/health'));

// Start server
const start = async () => {
  try {
    console.log('Step 1/3: Verifying Database Connection...');
    const model = new LeaderboardModel();
    await model.testConnection();
    console.log('✓ Database Connection Verified');

    console.log('Step 2/3: Starting Fastify Server...');
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✓ Fastify listening on port ${port}`);
    
    console.log('Step 3/3: Initializing Socket.IO...');
    // Setup Socket.IO after server starts
    io = new Server(fastify.server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('✓ Socket.IO Initialized');
    console.log(`🚀 Leaderboard API is ready and running on port ${port}`);
  } catch (err) {
    console.error('FATAL ERROR DURING STARTUP:');
    if (err.message.includes('DATABASE_URL')) {
      console.error('  → Missing DATABASE_URL! Please set it in your environment variables.');
    } else {
      console.error('  →', err.message);
    }
    fastify.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  console.error("Failed to start:", err);
  process.exit(1);
});
