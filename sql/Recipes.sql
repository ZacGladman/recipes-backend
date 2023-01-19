DROP TABLE IF EXISTS recipes;

CREATE TABLE  recipes (
    recipe_id          serial PRIMARY KEY,
    recipe_api_id        varchar(255) NOT NULL,
    recipe_name           varchar(255) NOT NULL UNIQUE,
    recipe_img_url        text,
    UNIQUE(recipe_api_id)
);