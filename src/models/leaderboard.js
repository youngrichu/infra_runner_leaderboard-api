const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

class LeaderboardModel {
  
  // Submit a new score
  async submitScore(playerData) {
    try {
      const result = await sql`
        INSERT INTO leaderboard (
          player_name,
          email,
          organization_name,
          score,
          game_duration,
          blueprints_collected,
          water_drops_collected,
          energy_cells_collected,
          played_at
        )
        VALUES (
          ${playerData.playerName},
          ${playerData.email},
          ${playerData.organizationName},
          ${playerData.score},
          ${playerData.gameDuration},
          ${playerData.blueprintsCollected},
          ${playerData.waterDropsCollected},
          ${playerData.energyCellsCollected},
          ${new Date().toISOString()}
        )
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      throw new Error(`Failed to submit score: ${error.message}`);
    }
  }

  // Get top scores (overall leaderboard)
  async getTopScores(limit = 10) {
    try {
      const data = await sql`
        SELECT * FROM leaderboard
        ORDER BY score DESC
        LIMIT ${limit}
      `;

      return data;
    } catch (error) {
      throw new Error(`Failed to get top scores: ${error.message}`);
    }
  }

  // Get player's best score
  async getPlayerBestScore(email) {
    try {
      const data = await sql`
        SELECT * FROM leaderboard
        WHERE email = ${email}
        ORDER BY score DESC
        LIMIT 1
      `;

      return data[0] || null;
    } catch (error) {
      throw new Error(`Failed to get player best score: ${error.message}`);
    }
  }

  // Get organization leaderboard
  async getOrganizationLeaderboard(organizationName, limit = 10) {
    try {
      const data = await sql`
        SELECT * FROM leaderboard
        WHERE organization_name = ${organizationName}
        ORDER BY score DESC
        LIMIT ${limit}
      `;

      return data;
    } catch (error) {
      throw new Error(`Failed to get organization leaderboard: ${error.message}`);
    }
  }

  // Get recent scores
  async getRecentScores(limit = 10) {
    try {
      const data = await sql`
        SELECT * FROM leaderboard
        ORDER BY played_at DESC
        LIMIT ${limit}
      `;

      return data;
    } catch (error) {
      throw new Error(`Failed to get recent scores: ${error.message}`);
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const data = await sql`
        SELECT
          score,
          game_duration,
          blueprints_collected,
          water_drops_collected,
          energy_cells_collected
        FROM leaderboard
      `;

      if (!data || data.length === 0) {
        return {
          totalPlayers: 0,
          averageScore: 0,
          averageGameDuration: 0,
          totalBlueprints: 0,
          totalWaterDrops: 0,
          totalEnergyCells: 0
        };
      }

      const totalPlayers = data.length;
      const averageScore = data.reduce((sum, record) => sum + record.score, 0) / totalPlayers;
      const averageGameDuration = data.reduce((sum, record) => sum + record.game_duration, 0) / totalPlayers;
      const totalBlueprints = data.reduce((sum, record) => sum + record.blueprints_collected, 0);
      const totalWaterDrops = data.reduce((sum, record) => sum + record.water_drops_collected, 0);
      const totalEnergyCells = data.reduce((sum, record) => sum + record.energy_cells_collected, 0);

      return {
        totalPlayers,
        averageScore: Math.round(averageScore),
        averageGameDuration: Math.round(averageGameDuration),
        totalBlueprints,
        totalWaterDrops,
        totalEnergyCells
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

module.exports = LeaderboardModel;