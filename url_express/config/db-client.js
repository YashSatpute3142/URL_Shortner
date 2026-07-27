import { MongoClient } from "mongodb";
import { env } from "./env.js";

export const dbClient = new MongoClient(env.MONGODB_URI);

try {
  await dbClient.connect();
  console.log("✅ Connected to MongoDB Atlas");
} catch (err) {
  console.error("❌ Failed to connect to MongoDB:", err);
}

// export const db = await mysql.createConnection({
//     host: env.DATABASE_HOST,
//     user: env.DATABASE_USER,
//     password: env.DATABASE_PASSWORD,
//     database: env.DATABASE_NAME,
// })