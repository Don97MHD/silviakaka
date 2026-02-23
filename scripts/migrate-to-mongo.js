// scripts/migrate-to-mongo.js
require('dotenv').config({ path: '.env.local' }); // Load environment variables
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const recipesFilePath = path.join(process.cwd(), 'data', 'recipes.json');
const {MONGODB_URI} = process.env;
const {MONGODB_DB} = process.env;

async function run() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");

    const db = client.db(MONGODB_DB);
    const recipesCollection = db.collection('recipes');

    // 1. Read the JSON file
    const recipesData = JSON.parse(fs.readFileSync(recipesFilePath, 'utf8'));
    if (!recipesData || recipesData.length === 0) {
      console.log("No recipes found in recipes.json. Exiting.");
      return;
    }
    console.log(`Found ${recipesData.length} recipes in recipes.json`);

    // 2. Clear existing recipes in the collection to avoid duplicates
    await recipesCollection.deleteMany({});
    console.log("Cleared existing recipes from the 'recipes' collection.");

    // 3. Insert new recipes
    const result = await recipesCollection.insertMany(recipesData);
    console.log(`${result.insertedCount} recipes were successfully inserted into the database.`);

  } catch (err) {
    console.error("An error occurred during migration:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

run().catch(console.dir);