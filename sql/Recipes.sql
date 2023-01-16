DROP TABLE IF EXISTS recipes;

CREATE TABLE  recipes (
    recipe_id          serial PRIMARY KEY,
    recipe_API_id        varchar(255) NOT NULL,
    recipe_name           varchar(255) NOT NULL UNIQUE
);