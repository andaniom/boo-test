'use strict';

const request = require('supertest');
const { app, db } = require('../app');
const User = require('../models/User');

describe('User API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'John Doe' })
        .expect(201);

      expect(res.body.name).toBe('John Doe');
      expect(res.body._id).toBeDefined();
    });

    it('should require name field', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      await User.create({ name: 'User 1' });
      await User.create({ name: 'User 2' });

      const res = await request(app)
        .get('/api/users')
        .expect(200);

      expect(res.body).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      const res = await request(app)
        .get('/api/users')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const user = await User.create({ name: 'Test User' });

      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(res.body.name).toBe('Test User');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .expect(404);

      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(res.body.error).toBe('Invalid user ID');
    });
  });
});
