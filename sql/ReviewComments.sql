DROP TABLE IF EXISTS review_comments;

CREATE TABLE  review_comments (
    comment_id          serial PRIMARY KEY,
    review_id          integer,
    commenter_user_id            integer,
    comment       text,
    FOREIGN KEY(review_id) REFERENCES recipe_reviews(review_id),
    FOREIGN KEY(commenter_user_id) REFERENCES users(user_id),
    UNIQUE(review_id, commenter_user_id)
);