const LeaderboardModel = require('../models/leaderboard');
const { submitScoreSchema, queryParamsSchema } = require('../utils/validation');

const leaderboardModel = new LeaderboardModel();

class LeaderboardController {
  
  // Submit a new score
  async submitScore(request, reply) {
    try {
      const { error, value } = submitScoreSchema.validate(request.body);
      
      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const submittedScore = await leaderboardModel.submitScore(value);
      
      // Emit realtime update
      request.server.io.emit('scoreSubmitted', {
        score: submittedScore,
        playerName: value.playerName,
        organizationName: value.organizationName
      });

      // Get updated leaderboard
      const updatedLeaderboard = await leaderboardModel.getTopScores(10);
      request.server.io.emit('leaderboardUpdated', updatedLeaderboard);

      reply.send({
        success: true,
        data: submittedScore,
        message: 'Score submitted successfully'
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get top scores
  async getTopScores(request, reply) {
    try {
      const { error, value } = queryParamsSchema.validate(request.query);
      
      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const topScores = await leaderboardModel.getTopScores(value.limit);
      
      reply.send({
        success: true,
        data: topScores,
        count: topScores.length
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get player's best score
  async getPlayerBestScore(request, reply) {
    try {
      const { email } = request.params;
      
      if (!email) {
        return reply.status(400).send({
          success: false,
          error: 'Email parameter is required'
        });
      }

      const playerBestScore = await leaderboardModel.getPlayerBestScore(email);
      
      reply.send({
        success: true,
        data: playerBestScore
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get organization leaderboard
  async getOrganizationLeaderboard(request, reply) {
    try {
      const { organizationName } = request.params;
      const { error, value } = queryParamsSchema.validate(request.query);
      
      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      if (!organizationName) {
        return reply.status(400).send({
          success: false,
          error: 'Organization name parameter is required'
        });
      }

      const orgLeaderboard = await leaderboardModel.getOrganizationLeaderboard(
        decodeURIComponent(organizationName), 
        value.limit
      );
      
      reply.send({
        success: true,
        data: orgLeaderboard,
        count: orgLeaderboard.length,
        organization: decodeURIComponent(organizationName)
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get recent scores
  async getRecentScores(request, reply) {
    try {
      const { error, value } = queryParamsSchema.validate(request.query);
      
      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const recentScores = await leaderboardModel.getRecentScores(value.limit);
      
      reply.send({
        success: true,
        data: recentScores,
        count: recentScores.length
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get statistics
  async getStatistics(request, reply) {
    try {
      const statistics = await leaderboardModel.getStatistics();
      
      reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

module.exports = LeaderboardController;