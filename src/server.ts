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

/* ================================================================= USERS */

// ADD a new user:
app.post("/users", async (req, res) => {
  const { username, userEmail } = req.body;
  const query =
    "INSERT INTO users(username, email) VALUES ($1, $2) ON CONFLICT DO NOTHING";
  try {
    await client.query(query, [username, userEmail]);
    res.status(200).send("user added!");
  } catch (error) {
    console.error(error);
  }
});

/* ================================================================= RECIPE REVIEWS */
/* ========================================== GET REQUESTS */
// Get ALL recipe reviews
app.get("/reviews", async (req, res) => {
  try {
    const response = await client.query("SELECT * FROM recipe_reviews");
    res.status(200).send(response.rows);
  } catch (error) {
    console.error(error);
  }
});

// Get 10 MOST RECENT recipe reviews
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
