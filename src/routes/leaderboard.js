const LeaderboardController = require('../controllers/leaderboardController');

const leaderboardController = new LeaderboardController();

async function leaderboardRoutes(fastify, options) {
  
  // Submit a new score
  fastify.post('/api/leaderboard/submit', {
    schema: {
      description: 'Submit a new score to the leaderboard',
      tags: ['Leaderboard'],
      body: {
        type: 'object',
        required: ['playerName', 'email', 'organizationName', 'score', 'gameDuration'],
        properties: {
          playerName: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          organizationName: { type: 'string', minLength: 1, maxLength: 255 },
          score: { type: 'integer', minimum: 0 },
          gameDuration: { type: 'integer', minimum: 0 },
          blueprintsCollected: { type: 'integer', minimum: 0, default: 0 },
          waterDropsCollected: { type: 'integer', minimum: 0, default: 0 },
          energyCellsCollected: { type: 'integer', minimum: 0, default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, leaderboardController.submitScore);

  // Get top scores
  fastify.get('/api/leaderboard/top', {
    schema: {
      description: 'Get top scores from the leaderboard',
      tags: ['Leaderboard'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            count: { type: 'integer' }
          }
        }
      }
    }
  }, leaderboardController.getTopScores);

  // Get player's best score
  fastify.get('/api/leaderboard/player/:email', {
    schema: {
      description: 'Get player\'s best score',
      tags: ['Leaderboard'],
      params: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, leaderboardController.getPlayerBestScore);

  // Get organization leaderboard
  fastify.get('/api/leaderboard/organization/:organizationName', {
    schema: {
      description: 'Get leaderboard for a specific organization',
      tags: ['Leaderboard'],
      params: {
        type: 'object',
        properties: {
          organizationName: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            count: { type: 'integer' },
            organization: { type: 'string' }
          }
        }
      }
    }
  }, leaderboardController.getOrganizationLeaderboard);

  // Get recent scores
  fastify.get('/api/leaderboard/recent', {
    schema: {
      description: 'Get recent scores from the leaderboard',
      tags: ['Leaderboard'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            count: { type: 'integer' }
          }
        }
      }
    }
  }, leaderboardController.getRecentScores);

  // Get statistics
  fastify.get('/api/leaderboard/statistics', {
    schema: {
      description: 'Get leaderboard statistics',
      tags: ['Leaderboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalPlayers: { type: 'integer' },
                averageScore: { type: 'integer' },
                averageGameDuration: { type: 'integer' },
                totalBlueprints: { type: 'integer' },
                totalWaterDrops: { type: 'integer' },
                totalEnergyCells: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, leaderboardController.getStatistics);
}

module.exports = leaderboardRoutes;