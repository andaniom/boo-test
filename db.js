'use strict';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to the in-memory MongoDB instance
 */
async function connect() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory MongoDB at', mongoUri);
}

/**
 * Disconnect and stop the MongoDB instance
 */
async function disconnect() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('Disconnected from MongoDB');
}

/**
 * Clear all collections (useful for testing)
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  connect,
  disconnect,
  clearDatabase
};
