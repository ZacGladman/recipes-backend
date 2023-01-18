INSERT INTO recipe_reviews(recipe_api_id, user_id, rating_value, review, submission_time)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT(recipe_api_id, user_id)
DO 
    UPDATE SET rating_value = $3, review = $4, submission_time = NOW()
