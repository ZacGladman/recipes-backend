DROP TABLE IF EXISTS recipe_reviews;

CREATE TABLE  recipe_reviews (
    review_id          serial PRIMARY KEY,
    recipe_id          integer,
    user_id            integer,
    rating_value       decimal,
    review              text,
    FOREIGN KEY(recipe_id) REFERENCES recipes(recipe_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    UNIQUE(recipe_id, user_id)
);