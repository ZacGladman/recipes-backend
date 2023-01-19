DROP TABLE IF EXISTS cooklist;

CREATE TABLE  cooklist (
    cooklist_id          serial PRIMARY KEY,
    recipe_id          integer,
    user_id            integer,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(recipe_id),
    UNIQUE(recipe_id, user_id)
);