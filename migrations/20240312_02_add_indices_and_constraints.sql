-- Constraints für athletes
ALTER TABLE athletes
    ADD CONSTRAINT check_height 
        CHECK (height BETWEEN 150 AND 220),
    ADD CONSTRAINT check_weight 
        CHECK (weight BETWEEN 50 AND 120),
    ADD CONSTRAINT check_experience 
        CHECK (experience_years >= 0),
    ADD CONSTRAINT check_season_points 
        CHECK (season_points >= 0),
    ADD CONSTRAINT check_world_rank 
        CHECK (world_rank > 0),
    ADD CONSTRAINT check_ratings 
        CHECK (overall_rating BETWEEN 0 AND 100 AND potential_rating BETWEEN 0 AND 100),
    ADD CONSTRAINT check_contract_salary 
        CHECK (contract_salary >= 0),
    ADD CONSTRAINT check_status 
        CHECK (status IN ('active', 'injured', 'retired', 'suspended'));

-- Constraints für athlete_stats
ALTER TABLE athlete_stats
    ADD CONSTRAINT check_stat_ranges 
        CHECK (
            slalom_technik BETWEEN 0 AND 100 AND
            riesenslalom_technik BETWEEN 0 AND 100 AND
            super_g_technik BETWEEN 0 AND 100 AND
            abfahrt_technik BETWEEN 0 AND 100 AND
            kraft BETWEEN 0 AND 100 AND
            explosivkraft BETWEEN 0 AND 100 AND
            ausdauer BETWEEN 0 AND 100 AND
            beweglichkeit BETWEEN 0 AND 100 AND
            mental_staerke BETWEEN 0 AND 100 AND
            risikobereitschaft BETWEEN 0 AND 100 AND
            stressresistenz BETWEEN 0 AND 100 AND
            konzentration BETWEEN 0 AND 100 AND
            kantentechnik BETWEEN 0 AND 100 AND
            gleittechnik BETWEEN 0 AND 100 AND
            sprungtechnik BETWEEN 0 AND 100 AND
            start_technik BETWEEN 0 AND 100 AND
            ziel_sprint BETWEEN 0 AND 100
        ),
    ADD CONSTRAINT check_form_ranges
        CHECK (
            form BETWEEN 70 AND 130 AND
            fitness BETWEEN 0 AND 100 AND
            ermuedung BETWEEN 0 AND 100
        ),
    ADD CONSTRAINT check_discipline_ratings
        CHECK (
            slalom_rating BETWEEN 0 AND 100 AND
            riesenslalom_rating BETWEEN 0 AND 100 AND
            super_g_rating BETWEEN 0 AND 100 AND
            abfahrt_rating BETWEEN 0 AND 100
        );

-- Constraints für athlete_achievements
ALTER TABLE athlete_achievements
    ADD CONSTRAINT check_position 
        CHECK (position > 0),
    ADD CONSTRAINT check_race_points 
        CHECK (race_points >= 0),
    ADD CONSTRAINT check_achievement_points 
        CHECK (season_points >= 0),
    ADD CONSTRAINT check_discipline 
        CHECK (discipline IN ('SL', 'GS', 'SG', 'DH', 'AC')),
    ADD CONSTRAINT check_competition_type 
        CHECK (competition_type IN ('World Cup', 'Championship', 'Olympics', 'Continental Cup'));

-- Constraints für athlete_injuries
ALTER TABLE athlete_injuries
    ADD CONSTRAINT check_severity 
        CHECK (severity BETWEEN 1 AND 5),
    ADD CONSTRAINT check_dates 
        CHECK (
            start_date <= expected_return_date AND
            (actual_return_date IS NULL OR actual_return_date >= start_date)
        ),
    ADD CONSTRAINT check_injury_status 
        CHECK (status IN ('active', 'recovered'));

-- Performance Indices
CREATE INDEX idx_athletes_nationality ON athletes(nationality);
CREATE INDEX idx_athletes_status ON athletes(status);
CREATE INDEX idx_athletes_world_rank ON athletes(world_rank);
CREATE INDEX idx_achievements_season ON athlete_achievements(season);
CREATE INDEX idx_achievements_discipline ON athlete_achievements(discipline);
CREATE INDEX idx_injuries_status ON athlete_injuries(status);

-- Composite Indices für häufige Abfragen
CREATE INDEX idx_athletes_team_status ON athletes(team_id, status);
CREATE INDEX idx_achievements_athlete_season ON athlete_achievements(athlete_id, season);
CREATE INDEX idx_stats_athlete_form ON athlete_stats(athlete_id, form); 