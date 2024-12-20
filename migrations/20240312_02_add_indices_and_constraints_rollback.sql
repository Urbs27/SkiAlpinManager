-- Entfernen der Constraints
ALTER TABLE athletes
    DROP CONSTRAINT IF EXISTS check_height,
    DROP CONSTRAINT IF EXISTS check_weight,
    DROP CONSTRAINT IF EXISTS check_experience,
    DROP CONSTRAINT IF EXISTS check_season_points,
    DROP CONSTRAINT IF EXISTS check_world_rank,
    DROP CONSTRAINT IF EXISTS check_ratings,
    DROP CONSTRAINT IF EXISTS check_contract_salary,
    DROP CONSTRAINT IF EXISTS check_status;

ALTER TABLE athlete_stats
    DROP CONSTRAINT IF EXISTS check_stat_ranges,
    DROP CONSTRAINT IF EXISTS check_form_ranges,
    DROP CONSTRAINT IF EXISTS check_discipline_ratings;

ALTER TABLE athlete_achievements
    DROP CONSTRAINT IF EXISTS check_position,
    DROP CONSTRAINT IF EXISTS check_race_points,
    DROP CONSTRAINT IF EXISTS check_achievement_points,
    DROP CONSTRAINT IF EXISTS check_discipline,
    DROP CONSTRAINT IF EXISTS check_competition_type;

ALTER TABLE athlete_injuries
    DROP CONSTRAINT IF EXISTS check_severity,
    DROP CONSTRAINT IF EXISTS check_dates,
    DROP CONSTRAINT IF EXISTS check_injury_status;

-- Entfernen der Indices
DROP INDEX IF EXISTS idx_athletes_nationality;
DROP INDEX IF EXISTS idx_athletes_status;
DROP INDEX IF EXISTS idx_athletes_world_rank;
DROP INDEX IF EXISTS idx_achievements_season;
DROP INDEX IF EXISTS idx_achievements_discipline;
DROP INDEX IF EXISTS idx_injuries_status;
DROP INDEX IF EXISTS idx_athletes_team_status;
DROP INDEX IF EXISTS idx_achievements_athlete_season;
DROP INDEX IF EXISTS idx_stats_athlete_form; 