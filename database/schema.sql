-- Supabase Database Schema for Leaderboard

CREATE TABLE leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    game_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    blueprints_collected INTEGER NOT NULL DEFAULT 0,
    water_drops_collected INTEGER NOT NULL DEFAULT 0,
    energy_cells_collected INTEGER NOT NULL DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_email ON leaderboard(email);
CREATE INDEX idx_leaderboard_organization ON leaderboard(organization_name);
CREATE INDEX idx_leaderboard_played_at ON leaderboard(played_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE
ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all records
CREATE POLICY "Allow authenticated users to read leaderboard" ON leaderboard
    FOR SELECT TO authenticated USING (true);

-- Create policy for authenticated users to insert their own records
CREATE POLICY "Allow authenticated users to insert scores" ON leaderboard
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create policy for service role to have full access
CREATE POLICY "Allow service role full access" ON leaderboard
    FOR ALL TO service_role USING (true);

-- Create a view for public leaderboard (without email) with SECURITY INVOKER
CREATE VIEW public_leaderboard 
WITH (security_invoker=true) AS
SELECT 
    id,
    player_name,
    organization_name,
    score,
    game_duration,
    blueprints_collected,
    water_drops_collected,
    energy_cells_collected,
    played_at
FROM leaderboard
ORDER BY score DESC;

-- Grant access to the view
GRANT SELECT ON public_leaderboard TO authenticated;
GRANT SELECT ON public_leaderboard TO anon;