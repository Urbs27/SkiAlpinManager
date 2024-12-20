-- Athleten Seed-Daten
INSERT INTO athletes (
    team_id, first_name, last_name, nationality, license_id,
    birth_date, height, weight, experience_years,
    season_points, world_rank, overall_rating, potential_rating,
    contract_salary, contract_end, status
) VALUES 
    -- ÖSV Team
    (1, 'Marco', 'Schwarz', 'AUT', 'AUT1234', '1995-08-16', 180, 80, 8, 
     850, 3, 92, 95, 950000, '2025-04-30', 'active'),
    (1, 'Vincent', 'Kriechmayr', 'AUT', 'AUT2345', '1991-10-01', 188, 85, 10, 
     720, 5, 90, 92, 880000, '2025-04-30', 'active'),
    (1, 'Manuel', 'Feller', 'AUT', 'AUT3456', '1992-10-13', 178, 75, 9, 
     680, 7, 88, 90, 820000, '2025-04-30', 'active'),

    -- Swiss-Ski Team
    (2, 'Marco', 'Odermatt', 'SUI', 'SUI1234', '1997-10-08', 183, 81, 6, 
     1200, 1, 95, 98, 1200000, '2025-04-30', 'active'),
    (2, 'Loic', 'Meillard', 'SUI', 'SUI2345', '1996-10-14', 176, 74, 7, 
     600, 8, 87, 90, 750000, '2025-04-30', 'active');

-- Athleten Stats
INSERT INTO athlete_stats (
    athlete_id,
    -- Technische Fähigkeiten
    slalom_technik, riesenslalom_technik, super_g_technik, abfahrt_technik,
    -- Physische Grundfähigkeiten
    kraft, explosivkraft, ausdauer, beweglichkeit,
    -- Mentale Fähigkeiten
    mental_staerke, risikobereitschaft, stressresistenz, konzentration,
    -- Ski-spezifische Fähigkeiten
    kantentechnik, gleittechnik, sprungtechnik, start_technik, ziel_sprint,
    -- Form
    form, fitness, ermuedung,
    -- Disziplin-Ratings
    slalom_rating, riesenslalom_rating, super_g_rating, abfahrt_rating
) VALUES 
    -- Marco Schwarz (Allrounder)
    (1, 90, 92, 88, 85,
        88, 87, 90, 85,
        92, 85, 88, 90,
        91, 88, 86, 88, 89,
        95, 92, 15,
        91, 92, 88, 85),
    
    -- Vincent Kriechmayr (Speed-Spezialist)
    (2, 82, 85, 93, 94,
        90, 92, 88, 84,
        90, 92, 88, 86,
        87, 93, 92, 90, 88,
        88, 90, 20,
        82, 85, 93, 94),
    
    -- Manuel Feller (Technik-Spezialist)
    (3, 93, 91, 84, 80,
        85, 88, 86, 90,
        88, 86, 85, 92,
        92, 85, 83, 87, 86,
        92, 88, 18,
        93, 91, 84, 80),
    
    -- Marco Odermatt (Top-Allrounder)
    (4, 94, 95, 93, 92,
        92, 93, 91, 90,
        94, 90, 93, 95,
        94, 93, 91, 92, 93,
        98, 95, 10,
        94, 95, 93, 92),
    
    -- Loic Meillard (Technik-Spezialist)
    (5, 91, 90, 85, 82,
        86, 87, 85, 89,
        87, 84, 86, 90,
        90, 86, 84, 86, 87,
        90, 89, 22,
        91, 90, 85, 82);

-- Beispiel-Achievements
INSERT INTO athlete_achievements (
    athlete_id, season, competition_type, discipline,
    position, race_points, season_points
) VALUES 
    -- Marco Odermatt
    (4, '2023/2024', 'World Cup', 'GS', 1, 0.00, 100),
    (4, '2023/2024', 'World Cup', 'SG', 1, 0.00, 100),
    -- Marco Schwarz
    (1, '2023/2024', 'World Cup', 'SL', 2, 4.20, 80),
    -- Vincent Kriechmayr
    (2, '2023/2024', 'World Cup', 'DH', 1, 0.00, 100);

-- Beispiel-Verletzungen
INSERT INTO athlete_injuries (
    athlete_id, injury_type, severity, start_date,
    expected_return_date, actual_return_date, status
) VALUES 
    (1, 'Knieverletzung', 4, '2024-01-15', '2024-03-15', NULL, 'active'),
    (3, 'Rückenprellung', 2, '2023-12-10', '2023-12-25', '2023-12-23', 'recovered'); 