import { getEnvVarOrFail } from "./envVarUtils";

export function setupDBClientConfig() {
  //For the ssl property of the DB connection config, use a value of...
  //   false - when connecting to a local DB
  //   { rejectUnauthorized: false } - when connecting to a render.com DB or heroku DB
  const dbEnvVarName = process.env.USE_LOCAL_DB
    ? "LOCAL_DATABASE_URL"
    : "DATABASE_URL";
  const connectionString = getEnvVarOrFail(dbEnvVarName);

  const sslSetting = process.env.USE_LOCAL_DB
    ? false
    : { rejectUnauthorized: false };

  console.log("Using db env var name:", dbEnvVarName, "with ssl:", sslSetting);

  const dbConfig = {
    connectionString,
    ssl: sslSetting,
  };
  return dbConfig;
}
