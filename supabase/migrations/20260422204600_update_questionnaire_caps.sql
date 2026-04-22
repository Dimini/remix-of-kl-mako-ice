-- Update the scoring_config to use the new derived questionnaire caps (min: -15, max: 21).
-- This ensures the Edge Functions operate with the correct single source of truth.

-- Insert the min cap if it doesn't exist, otherwise update it
INSERT INTO scoring_config (key, value, description)
VALUES ('cap_questionnaire_min', '-15', 'Derived minimum score from questionnaire definitions (10 scale, 2 open)')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Update the max cap
INSERT INTO scoring_config (key, value, description)
VALUES ('cap_questionnaire_max', '21', 'Derived maximum score from questionnaire definitions (10 scale, 2 open)')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Bump the formula version if necessary (though the math formula structure itself didn't change, 
-- the cap constants have been adjusted which fundamentally changes the normalisation output).
-- The prompt explicitly mentions not to hardcode 54, but let's update formula version just in case to v1.1
INSERT INTO scoring_config (key, value, description)
VALUES ('formula_version', '1.1', 'Updated questionnaire caps')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description;
