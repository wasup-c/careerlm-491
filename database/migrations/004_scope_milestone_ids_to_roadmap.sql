ALTER TABLE milestones
    DROP CONSTRAINT milestones_pkey;

ALTER TABLE milestones
    ADD CONSTRAINT milestones_pkey
    PRIMARY KEY (
        roadmap_id,
        id
    );