CREATE TABLE  recipe_reviews (
    review_id          serial PRIMARY KEY,
    recipe_api_id          integer,
    user_id            integer,
    rating_value       decimal,
    review              text,
    submission_time     date,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    UNIQUE(recipe_api_id, user_id)
);