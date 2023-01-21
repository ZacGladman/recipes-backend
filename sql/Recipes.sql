DROP TABLE IF EXISTS recipes;

CREATE TABLE  recipes (
    recipe_api_id        varchar(255) PRIMARY KEY,
    recipe_name           varchar(255) NOT NULL UNIQUE,
    recipe_img_url        text,
    UNIQUE(recipe_api_id)
);