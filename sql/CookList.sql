DROP TABLE IF EXISTS cooklist;

CREATE TABLE  cooklist (
    cooklist_id          serial PRIMARY KEY,
    recipe_api_id          varchar(255),
    user_id            integer,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(recipe_api_id) REFERENCES recipes(recipe_api_id),
    UNIQUE(recipe_api_id, user_id)
);