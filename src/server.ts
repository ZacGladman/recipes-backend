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
    "INSERT INTO users(username, email) VALUES ($1, $2) ON CONFLICT DO NOTHING";
  try {
    await client.query(query, [username, userEmail]);
    res.status(200).send("user added!");
  } catch (error) {
    console.error(error);
  }
});

/* ================================================================= RECIPES =======*/

//POST a new recipe
app.post("recipes", async (req, res) => {
  try {
    const query =
      "INSERT INTO recipes (recipe_api_id, recipe_name, recipe_img_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING";
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
app.get("/reviews", async (req, res) => {
  try {
    const response = await client.query("SELECT * FROM recipe_reviews"); // JOIN TO GET USER NAME NOT ID, AND RECIPE_API_ID NOT RECIPE_ID?
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

// GET 10 MOST RECENT recipe reviews
app.get("/reviews/10", async (req, res) => {
  try {
    const response = await client.query(
      "SELECT * FROM recipe_reviews ORDER BY review_id DESC LIMIT 10"
    );
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET 10 highest-rated (average) recipes ===========================> TEST THIS!!!!!!!
app.get("/reviews", async (req, res) => {
  try {
    const response = await client.query(
      "SELECT recipe_api_id, AVG(rating_value) FROM recipe_reviews GROUP BY recipe_api_id ORDER BY AVG(rating_value) DESC LIMIT 10" //UPDATE THIS
    );
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

//GET a SPECIFIC USER'S recipe reviews
app.get("/reviews/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const query = "SELECT * FROM recipe_reviews WHERE user_id = $1";
    const response = await client.query(query, [userID]);
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

/* ================================================= POST REQUESTS */
//POST a new review
app.post("/reviews/new-full", async (req, res) => {
  try {
    const { recipe_api_id, user_id, rating_value, review } = req.body;
    const values = [recipe_api_id, user_id, rating_value, review];
    const query =
      "INSERT INTO recipe_reviews(recipe_api_id, user_id, rating_value, review, submission_time) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT(recipe_api_id, user_id) DO UPDATE SET rating_value = $3, review = $4, submission_time = NOW()";
    await client.query(query, values);
    res.status(200).send("review upsert successful");
  } catch (error) {
    console.error(error);
  }
});

//POST a new quick rating
app.post("/reviews/new-quick", async (req, res) => {
  try {
    const { recipe_api_id, user_id, rating_value } = req.body;
    const query =
      "INSERT INTO recipe_reviews(recipe_api_id, user_id, rating_value) VALUES ($1, $2, $3) ON CONFLICT(recipe_api_id, user_id) DO UPDATE SET rating_value = $3";
    await client.query(query, [recipe_api_id, user_id, rating_value]);
    res.status(200).send("quick rating upsert successful");
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
