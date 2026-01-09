'use strict';

const express = require('express');
const path = require('path');
const db = require('./db');
const Category = require('./models/Category');

const app = express();
const port = process.env.PORT || 3000;

// Seed categories function
async function seedCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      { name: 'Anime', order: 1 },
      { name: 'Music', order: 2 },
      { name: 'Politics', order: 3 },
      { name: 'Historians', order: 4 },
      { name: 'Gaming', order: 5 },
      { name: 'Art', order: 6 },
      { name: 'Comics', order: 7 },
      { name: 'Science', order: 8 },
      { name: 'Philosophy', order: 9 },
      { name: 'Movies', order: 10 },
      { name: 'Television', order: 11 },
      { name: 'Literature', order: 12 },
      { name: 'Business', order: 13 },
      { name: 'Religion', order: 14 },
      { name: 'Pop Culture', order: 15 },
      { name: 'Internet', order: 16 },
      { name: 'Technology', order: 17 }
    ];
    await Category.insertMany(defaultCategories);
    console.log('Seeded database with categories');
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// API routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api', require('./routes/api/comments'));

// Profile routes
const profileModule = require('./routes/profile')();
app.use('/', profileModule.router);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server with database connection
async function startServer() {
  try {
    await db.connect();
    await profileModule.seedDatabase();
    await seedCategories();
    
    const server = app.listen(port);
    console.log('Express started. Listening on %s', port);
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export for testing
module.exports = { app, startServer, db };
