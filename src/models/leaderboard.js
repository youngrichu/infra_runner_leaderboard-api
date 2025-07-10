const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class LeaderboardModel {
  
  // Submit a new score
  async submitScore(playerData) {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{
        player_name: playerData.playerName,
        email: playerData.email,
        organization_name: playerData.organizationName,
        score: playerData.score,
        game_duration: playerData.gameDuration,
        blueprints_collected: playerData.blueprintsCollected,
        water_drops_collected: playerData.waterDropsCollected,
        energy_cells_collected: playerData.energyCellsCollected,
        played_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      throw new Error(`Failed to submit score: ${error.message}`);
    }

    return data[0];
  }

  // Get top scores (overall leaderboard)
  async getTopScores(limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get top scores: ${error.message}`);
    }

    return data;
  }

  // Get player's best score
  async getPlayerBestScore(email) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('email', email)
      .order('score', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to get player best score: ${error.message}`);
    }

    return data[0] || null;
  }

  // Get organization leaderboard
  async getOrganizationLeaderboard(organizationName, limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('organization_name', organizationName)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get organization leaderboard: ${error.message}`);
    }

    return data;
  }

  // Get recent scores
  async getRecentScores(limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent scores: ${error.message}`);
    }

    return data;
  }

  // Get statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score, game_duration, blueprints_collected, water_drops_collected, energy_cells_collected');

    if (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }

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
  }
}

module.exports = LeaderboardModel;