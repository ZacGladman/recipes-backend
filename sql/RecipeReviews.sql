CREATE TABLE  recipe_reviews (
    review_id          serial PRIMARY KEY,
    recipe_id          integer,
    user_id            integer,
    rating_value       decimal,
    review              text,
    submission_time     date,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(recipe_id),
    UNIQUE(recipe_id, user_id)
);
