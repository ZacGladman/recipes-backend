DROP TABLE IF EXISTS users;

CREATE TABLE  users (
    user_id          serial PRIMARY KEY,
    username        varchar(255) NOT NULL,
    email           varchar(255) NOT NULL UNIQUE,
    profile_pic     text
);

INSERT INTO users (username, email) VALUES ('zac', 'zacg@email')