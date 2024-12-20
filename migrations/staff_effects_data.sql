-- Effekte verschiedener Personalrollen
CREATE TABLE staff_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    attribute_affected TEXT NOT NULL,
    base_effect_value INTEGER NOT NULL,
    quality_multiplier REAL DEFAULT 0.01, -- Effekt pro Qualitätspunkt
    experience_multiplier REAL DEFAULT 0.005 -- Effekt pro Erfahrungspunkt
);

-- Initiale Effekt-Daten
INSERT INTO staff_effects 
(role, effect_type, attribute_affected, base_effect_value, quality_multiplier, experience_multiplier)
VALUES 
-- Coach Effekte
('coach', 'training', 'technik', 5, 0.02, 0.01),
('coach', 'training', 'taktik', 4, 0.015, 0.008),
('coach', 'training', 'mental', 3, 0.01, 0.005),

-- Physiotherapeut Effekte
('physiotherapist', 'recovery', 'fitness', 5, 0.015, 0.007),
('physiotherapist', 'recovery', 'müdigkeit', -3, 0.02, 0.01),
('physiotherapist', 'prevention', 'verletzungsrisiko', -2, 0.01, 0.005),

-- Ski-Techniker Effekte
('ski_technician', 'equipment', 'gleittechnik', 5, 0.02, 0.01),
('ski_technician', 'equipment', 'kantentechnik', 4, 0.015, 0.008),
('ski_technician', 'preparation', 'material_quality', 3, 0.02, 0.01),

-- Analyst Effekte
('analyst', 'analysis', 'technik', 4, 0.015, 0.007),
('analyst', 'analysis', 'taktik', 3, 0.02, 0.01),
('analyst', 'training', 'lernrate', 3, 0.01, 0.005),

-- Arzt Effekte
('doctor', 'medical', 'verletzungsrisiko', -4, 0.02, 0.01),
('doctor', 'recovery', 'heilungszeit', -3, 0.015, 0.008),
('doctor', 'prevention', 'fitness', 3, 0.01, 0.005),

-- Manager Effekte
('manager', 'motivation', 'mental', 4, 0.015, 0.007),
('manager', 'organization', 'trainingseffizienz', 3, 0.02, 0.01),
('manager', 'planning', 'wettkampfvorbereitung', 3, 0.01, 0.005); 