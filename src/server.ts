import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (req, res) => {
  res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

/* ================================================================= USERS =========*/

// ADD a new user:
app.post("/users", async (req, res) => {
  const { username, userEmail, profilePic } = req.body;
  const query =
    "WITH e AS(INSERT INTO users(username, email, profile_pic) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING user_id) SELECT * FROM e UNION SELECT user_id FROM users WHERE email = $2";
  try {
    const response = await client.query(query, [
      username,
      userEmail,
      profilePic,
    ]);
    res.status(200).send(response.rows[0]);
  } catch (error) {
    console.error(error);
  }
});

/* ================================================================= RECIPES =======*/

//POST a new recipe
app.post("/recipes", async (req, res) => {
  try {
    const query =
      "INSERT INTO recipes (recipe_api_id, recipe_name, recipe_img_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *";
    const { recipe_api_id, recipe_name, recipe_img_url } = req.body;
    const response = await client.query(query, [
      recipe_api_id,
      recipe_name,
      recipe_img_url,
    ]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

/* ================================================================= RECIPE REVIEWS */
/* ================================================= GET REQUESTS */
// GET ALL recipe reviews
const baseQuery =
  "SELECT recipes.recipe_api_id, recipes.recipe_name, recipes.recipe_img_url, recipe_reviews.review_id, recipe_reviews.rating_value, recipe_reviews.review, recipe_reviews.submission_time, users.username, users.profile_pic FROM recipe_reviews INNER JOIN recipes ON recipes.recipe_api_id = recipe_reviews.recipe_api_id INNER JOIN users ON users.user_id = recipe_reviews.user_id";

app.get("/reviews", async (req, res) => {
  try {
    const response = await client.query(baseQuery);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

// GET 10 MOST RECENT recipe reviews
app.get("/reviews/newest-10", async (req, res) => {
  try {
    const query =
      baseQuery + " ORDER BY recipe_reviews.review_id DESC LIMIT 10";
    const response = await client.query(query);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET 10 highest-rated (average) recipes
app.get("/reviews/top-10-rated", async (req, res) => {
  try {
    const query =
      "SELECT recipes.recipe_api_id, recipes.recipe_name, recipes.recipe_img_url, AVG(recipe_reviews.rating_value) FROM recipe_reviews INNER JOIN recipes ON recipes.recipe_api_id = recipe_reviews.recipe_api_id GROUP BY recipes.recipe_name, recipes.recipe_api_id, recipes.recipe_img_url ORDER BY AVG(recipe_reviews.rating_value) DESC LIMIT 10";
    const response = await client.query(query);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET a SPECIFIC USER'S recipe reviews
app.get("/reviews/user/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const query = baseQuery + " WHERE users.user_id = $1";
    const response = await client.query(query, [userID]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET a SPECIFIC USER's recipe review for a SPECIFIC RECIPE
app.get("/reviews/recipe/:recipeID/user/:userID", async (req, res) => {
  try {
    const { recipeID, userID } = req.params;
    const query =
      "SELECT rating_value, review FROM recipe_reviews WHERE recipe_api_id = $1 AND user_id = $2";
    const response = await client.query(query, [recipeID, userID]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET all reviews for a specific recipe
app.get("/reviews/recipe/:recipeID", async (req, res) => {
  const recipe_api_id = req.params.recipeID;
  const query =
    "SELECT recipes.recipe_api_id, recipe_reviews.review_id, recipe_reviews.rating_value, recipe_reviews.review, recipe_reviews.submission_time, users.username, users.profile_pic FROM recipe_reviews INNER JOIN recipes ON recipes.recipe_api_id = recipe_reviews.recipe_api_id INNER JOIN users ON users.user_id = recipe_reviews.user_id WHERE recipes.recipe_api_id = $1";
  const response = await client.query(query, [recipe_api_id]);
  res.status(200).send(response.rows);
});

/* ================================================= POST REQUESTS */
//POST a new review
app.post(
  "/reviews/new-full/recipe/:recipeID/user/:userID",
  async (req, res) => {
    try {
      const { recipeID, userID } = req.params;
      const { rating_value, review } = req.body;
      const values = [recipeID, userID, rating_value, review];
      const query =
        "INSERT INTO recipe_reviews(recipe_api_id, user_id, rating_value, review, submission_time) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT(recipe_api_id, user_id) DO UPDATE SET rating_value = $3, review = $4, submission_time = NOW()";
      await client.query(query, values);
      res.status(200).send("review upsert successful");
    } catch (error) {
      console.error(error);
    }
  }
);

//POST a new quick rating
app.post(
  "/reviews/new-quick/recipe/:recipeID/user/:userID",
  async (req, res) => {
    try {
      const { recipeID, userID } = req.params;
      const { rating_value } = req.body;
      const query =
        "INSERT INTO recipe_reviews(recipe_api_id, user_id, rating_value) VALUES ($1, $2, $3) ON CONFLICT(recipe_api_id, user_id) DO UPDATE SET rating_value = $3";
      await client.query(query, [recipeID, userID, rating_value]);
      res.status(200).send("quick rating upsert successful");
    } catch (error) {
      console.error(error);
    }
  }
);

/* ================================================================= COOK LIST */
/* ========================= GET a specific user's cooklist items */
app.get("/user/:userID/cooklist", async (req, res) => {
  try {
    const user_id = req.params.userID;
    const query =
      "SELECT recipes.recipe_api_id, recipes.recipe_name, recipes.recipe_img_url FROM recipes INNER JOIN cooklist ON recipes.recipe_api_id = cooklist.recipe_api_id WHERE cooklist.user_id = $1";
    const response = await client.query(query, [user_id]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

/* ============== GET whether or not recipe is in a user's cooklist */
app.get("/user/:userID/cooklist/recipe/:recipeID", async (req, res) => {
  try {
    const { userID, recipeID } = req.params;
    const query =
      "SELECT * FROM cooklist WHERE recipe_api_id = $1 AND user_id = $2";
    const response = await client.query(query, [recipeID, userID]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

/* =========================== POST a new item to a user's cooklist */
app.post("/user/:userID/cooklist/new", async (req, res) => {
  try {
    const user_id = req.params.userID;
    const { recipe_api_id } = req.body;
    const query =
      "WITH e AS(INSERT INTO cooklist(recipe_api_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING cooklist_id) SELECT * FROM e UNION SELECT cooklist_id FROM cooklist WHERE recipe_api_id = $1 AND user_id = $2";
    const response = await client.query(query, [recipe_api_id, user_id]);
    res.status(200).send(response.rows[0]);
  } catch (error) {
    console.error(error);
  }
});

/* ========================== DELETE an item from a user's cooklist */
app.delete("/cooklist/:cooklist_id", async (req, res) => {
  try {
    const { cooklist_id } = req.params;

    const query = "DELETE FROM cooklist WHERE cooklist_id = $1";
    await client.query(query, [cooklist_id]);
    res.status(200).send("item deleted from cooklist");
  } catch (error) {
    console.error(error);
  }
});

connectToDBAndStartListening();

async function connectToDBAndStartListening() {
  console.log("Attempting to connect to db");
  await client.connect();
  console.log("Connected to db!");

  const port = getEnvVarOrFail("PORT");
  app.listen(port, () => {
    console.log(
      `Server started listening for HTTP requests on port ${port}.  Let's go!`
    );
  });
}
