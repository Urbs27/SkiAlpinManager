-- Tabellen wiederherstellen
ALTER TABLE athletes RENAME TO athletes_temp;
ALTER TABLE athlete_stats RENAME TO athlete_stats_temp;
ALTER TABLE athletes_old RENAME TO athletes;
ALTER TABLE athlete_stats_old RENAME TO athlete_stats;

-- Neue Tabellen droppen
DROP TABLE athletes_temp;
DROP TABLE athlete_stats_temp;
DROP TABLE athlete_achievements;
DROP TABLE athlete_injuries; 