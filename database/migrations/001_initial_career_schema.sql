CREATE TABLE users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    name TEXT,
    target_role TEXT,

    experience_level TEXT
        CHECK (
            experience_level IS NULL
            OR experience_level IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),

    schema_version SMALLINT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questionnaires (
    user_id TEXT PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    target_role TEXT NOT NULL,

    experience_level TEXT NOT NULL
        CHECK (
            experience_level IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),

    existing_skills JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (
            jsonb_typeof(existing_skills) = 'array'
        ),

    learning_style TEXT NOT NULL,

    weekly_hours INTEGER NOT NULL
        CHECK (
            weekly_hours >= 0
        ),

    additional_responses JSONB,

    schema_version SMALLINT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resumes (
    user_id TEXT PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    normalized_text TEXT NOT NULL,

    sections JSONB NOT NULL
        CHECK (
            jsonb_typeof(sections) = 'object'
        ),

    schema_version SMALLINT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_preferences (
    user_id TEXT PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    keywords TEXT NOT NULL,

    location TEXT,

    workplace_types JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (
            jsonb_typeof(workplace_types) = 'array'
        ),

    employment_types JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (
            jsonb_typeof(employment_types) = 'array'
        ),

    experience_levels JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (
            jsonb_typeof(experience_levels) = 'array'
        ),

    use_resume_for_matching BOOLEAN NOT NULL DEFAULT FALSE,

    use_portfolio_for_matching BOOLEAN NOT NULL DEFAULT FALSE,

    schema_version SMALLINT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roadmaps (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,
    target_role TEXT NOT NULL,

    estimated_weeks INTEGER NOT NULL
        CHECK (
            estimated_weeks >= 0
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE milestones (
    id TEXT PRIMARY KEY,

    roadmap_id TEXT NOT NULL
        REFERENCES roadmaps(id)
        ON DELETE CASCADE,

    milestone_order INTEGER NOT NULL
        CHECK (
            milestone_order >= 0
        ),

    title TEXT NOT NULL,

    description TEXT NOT NULL,

    estimated_hours INTEGER NOT NULL
        CHECK (
            estimated_hours >= 0
        ),

    skills JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (
            jsonb_typeof(skills) = 'array'
        ),

    status TEXT NOT NULL
        CHECK (
            status IN (
                'not-started',
                'in-progress',
                'completed'
            )
        ),

    CONSTRAINT milestones_roadmap_order_unique
        UNIQUE (
            roadmap_id,
            milestone_order
        )
);

CREATE INDEX milestones_roadmap_id_index
    ON milestones (
        roadmap_id
    );