const fastify = require('fastify')({ logger: true });
const { Server } = require('socket.io');
require('dotenv').config();

// Setup Socket.IO variable to be accessible in routes
let io;

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: true
});

fastify.register(require('@fastify/helmet'));

fastify.register(require('@fastify/rate-limit'), {
  max: 100,
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
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    // Setup Socket.IO after server starts
    io = new Server(fastify.server, {
      cors: {
        origin: "*",
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

    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();