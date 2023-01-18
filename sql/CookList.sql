CREATE TABLE  cooklist (
    cooklist_id          serial PRIMARY KEY,
    recipe_api_id          integer,
    user_id            integer,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    UNIQUE(recipe_api_id, user_id)
);