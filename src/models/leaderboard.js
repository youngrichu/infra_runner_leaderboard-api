const { neon } = require('@neondatabase/serverless');

class LeaderboardModel {
  constructor() {
    // Initialize Neon client
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set. Leaderboard operations will fail.');
    } else {
      this.sql = neon(process.env.DATABASE_URL);
    }
  }

  async testConnection() {
    if (!this.sql) {
      throw new Error('DATABASE_URL is not set. Check your environment variables.');
    }
    try {
      await this.sql`SELECT 1`;
      return true;
    } catch (err) {
      console.error('Database connection test failed:', err.message);
      throw err;
    }
  }

  async submitScore(data) {
    if (!this.sql) throw new Error('Database connection not initialized');

    const result = await this.sql`
      INSERT INTO leaderboard (
        player_name,
        email,
        organization_name,
        score,
        game_duration,
        blueprints_collected,
        water_drops_collected,
        energy_cells_collected
      ) VALUES (
        ${data.playerName},
        ${data.email},
        ${data.organizationName},
        ${data.score},
        ${data.gameDuration},
        ${data.blueprintsCollected || 0},
        ${data.waterDropsCollected || 0},
        ${data.energyCellsCollected || 0}
      )
      RETURNING *
    `;

    return result[0];
  }

  async getTopScores(limit = 10) {
    if (!this.sql) throw new Error('Database connection not initialized');

    // Using the public_leaderboard view which excludes emails
    const scores = await this.sql`
      SELECT * FROM public_leaderboard
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return scores;
  }

  async getPlayerBestScore(email) {
    if (!this.sql) throw new Error('Database connection not initialized');

    const result = await this.sql`
      SELECT * FROM leaderboard
      WHERE email = ${email}
      ORDER BY score DESC
      LIMIT 1
    `;

    return result.length > 0 ? result[0] : null;
  }

  async getOrganizationLeaderboard(organizationName, limit = 10) {
    if (!this.sql) throw new Error('Database connection not initialized');

    // Using the public_leaderboard view
    const scores = await this.sql`
      SELECT * FROM public_leaderboard
      WHERE organization_name = ${organizationName}
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return scores;
  }

  async getRecentScores(limit = 10) {
    if (!this.sql) throw new Error('Database connection not initialized');

    // Using the public_leaderboard view
    const scores = await this.sql`
      SELECT * FROM public_leaderboard
      ORDER BY played_at DESC
      LIMIT ${limit}
    `;

    return scores;
  }

  async getStatistics() {
    if (!this.sql) throw new Error('Database connection not initialized');

    const result = await this.sql`
      SELECT
        COUNT(*) as total_players,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(game_duration), 0) as average_game_duration,
        COALESCE(SUM(blueprints_collected), 0) as total_blueprints,
        COALESCE(SUM(water_drops_collected), 0) as total_water_drops,
        COALESCE(SUM(energy_cells_collected), 0) as total_energy_cells
      FROM leaderboard
    `;

    const stats = result[0];

    return {
      totalPlayers: parseInt(stats.total_players || 0, 10),
      averageScore: Math.round(parseFloat(stats.average_score || 0)),
      averageGameDuration: Math.round(parseFloat(stats.average_game_duration || 0)),
      totalBlueprints: parseInt(stats.total_blueprints || 0, 10),
      totalWaterDrops: parseInt(stats.total_water_drops || 0, 10),
      totalEnergyCells: parseInt(stats.total_energy_cells || 0, 10)
    };
  }
}

module.exports = LeaderboardModel;
