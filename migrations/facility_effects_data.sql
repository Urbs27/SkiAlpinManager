-- Effekte der verschiedenen Einrichtungen
INSERT INTO facility_effects 
(facility_id, effect_type, attribute_affected, effect_value) 
SELECT 
    f.id,
    CASE f.facility_type
        WHEN 'ski_service' THEN 'equipment'
        WHEN 'training_slope' THEN 'training'
        WHEN 'gym' THEN 'strength'
        WHEN 'medical' THEN 'recovery'
        WHEN 'recovery' THEN 'regeneration'
        WHEN 'analysis' THEN 'technique'
        WHEN 'lodge' THEN 'rest'
    END as effect_type,
    CASE f.facility_type
        WHEN 'ski_service' THEN 'gleittechnik'
        WHEN 'training_slope' THEN 'technik'
        WHEN 'gym' THEN 'kraft'
        WHEN 'medical' THEN 'fitness'
        WHEN 'recovery' THEN 'müdigkeit'
        WHEN 'analysis' THEN 'kurven_technik'
        WHEN 'lodge' THEN 'mental'
    END as attribute_affected,
    f.level * 5 as effect_value
FROM team_facilities f; 