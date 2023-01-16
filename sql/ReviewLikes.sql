DROP TABLE IF EXISTS review_likes;

CREATE TABLE  review_likes (
    review_id          integer,
    liker_user_id            integer,
    FOREIGN KEY(review_id) REFERENCES recipe_reviews(review_id),
    FOREIGN KEY(liker_user_id) REFERENCES users(user_id),
    PRIMARY KEY(review_id, liker_user_id)
);