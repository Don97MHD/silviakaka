// scripts/migrate-categories.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');
const {MONGODB_URI} = process.env;
const {MONGODB_DB} = process.env;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error("MongoDB URI or DB name is not defined in .env.local");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");

    const db = client.db(MONGODB_DB);
    const categoriesCollection = db.collection('categories');

    const categoriesData = JSON.parse(fs.readFileSync(categoriesFilePath, 'utf8'));
    if (!categoriesData || categoriesData.length === 0) {
      console.log("No categories found in categories.json. Exiting.");
      return;
    }
    console.log(`Found ${categoriesData.length} categories in categories.json`);

    await categoriesCollection.deleteMany({});
    console.log("Cleared existing documents from the 'categories' collection.");

    const result = await categoriesCollection.insertMany(categoriesData);
    console.log(`${result.insertedCount} categories were successfully inserted into the database.`);

  } catch (err) {
    console.error("An error occurred during migration:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

run().catch(console.dir);