const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    throw new Error('Please define the MONGODB_CONNECTION_STRING environment variable');
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db('feathersofmundra'); // Automatically creates db if not exists
  
  cachedDb = db;
  return db;
}

module.exports = { connectToDatabase };
