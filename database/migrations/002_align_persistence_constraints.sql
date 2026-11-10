ALTER TABLE questionnaires
    DROP CONSTRAINT IF EXISTS questionnaires_weekly_hours_check;

ALTER TABLE questionnaires
    ADD CONSTRAINT questionnaires_weekly_hours_check
    CHECK (
        weekly_hours > 0
        AND weekly_hours <= 168
    );

ALTER TABLE roadmaps
    DROP CONSTRAINT IF EXISTS roadmaps_estimated_weeks_check;

ALTER TABLE roadmaps
    ADD CONSTRAINT roadmaps_estimated_weeks_check
    CHECK (
        estimated_weeks >= 1
    );

ALTER TABLE milestones
    DROP CONSTRAINT IF EXISTS milestones_milestone_order_check;

ALTER TABLE milestones
    ADD CONSTRAINT milestones_milestone_order_check
    CHECK (
        milestone_order >= 1
    );

ALTER TABLE users
    ADD CONSTRAINT users_id_length_check
    CHECK (
        char_length(id) >= 1
        AND char_length(id) <= 128
    );