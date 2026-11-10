ALTER TABLE users
    ADD COLUMN email TEXT;

ALTER TABLE users
    ADD COLUMN password_hash TEXT;

ALTER TABLE users
    ADD CONSTRAINT users_email_length_check
    CHECK (
        email IS NULL
        OR (
            char_length(email) >= 3
            AND char_length(email) <= 254
        )
    );

ALTER TABLE users
    ADD CONSTRAINT users_email_normalized_check
    CHECK (
        email IS NULL
        OR email = lower(btrim(email))
    );

ALTER TABLE users
    ADD CONSTRAINT users_auth_fields_pair_check
    CHECK (
        (
            email IS NULL
            AND password_hash IS NULL
        )
        OR
        (
            email IS NOT NULL
            AND password_hash IS NOT NULL
        )
    );

CREATE UNIQUE INDEX users_email_lower_unique
    ON users (
        lower(email)
    )
    WHERE email IS NOT NULL;

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT sessions_token_hash_length_check
        CHECK (
            char_length(token_hash) = 64
        ),

    CONSTRAINT sessions_expiration_check
        CHECK (
            expires_at > created_at
        )
);

CREATE INDEX sessions_user_id_index
    ON sessions (
        user_id
    );

CREATE INDEX sessions_expires_at_index
    ON sessions (
        expires_at
    );