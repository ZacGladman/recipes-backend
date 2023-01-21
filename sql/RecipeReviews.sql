CREATE TABLE  recipe_reviews (
    review_id          serial PRIMARY KEY,
    recipe_api_id          varchar(255),
    user_id            integer,
    rating_value       decimal,
    review              text,
    submission_time     date,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(recipe_api_id) REFERENCES recipes(recipe_api_id),
    UNIQUE(recipe_api_id, user_id)
);
