'use strict';

const request = require('supertest');
const { app, db } = require('../app');
const Profile = require('../models/Profile');

describe('Profile API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
  });

  describe('POST /api/profile', () => {
    it('should create a new profile', async () => {
      const profileData = {
        name: 'Test User',
        description: 'A test user profile',
        mbti: 'INTJ',
        enneagram: '5w6'
      };

      const res = await request(app)
        .post('/api/profile')
        .send(profileData)
        .expect(201);

      expect(res.body.name).toBe('Test User');
      expect(res.body.mbti).toBe('INTJ');
      expect(res.body._id).toBeDefined();
    });

    it('should require name field', async () => {
      const res = await request(app)
        .post('/api/profile')
        .send({ description: 'No name' })
        .expect(400);

      expect(res.body.error).toContain('required');
    });

    it('should use default image if not provided', async () => {
      const res = await request(app)
        .post('/api/profile')
        .send({ name: 'Test' })
        .expect(201);

      expect(res.body.image).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg');
    });
  });

  describe('GET /api/profile/:id', () => {
    it('should return JSON profile data', async () => {
      const profile = await Profile.create({
        name: 'JSON Test',
        mbti: 'ISTP'
      });

      const res = await request(app)
        .get(`/api/profile/${profile._id}`)
        .expect(200);

      expect(res.body.name).toBe('JSON Test');
      expect(res.body.mbti).toBe('ISTP');
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app)
        .get('/api/profile/507f1f77bcf86cd799439011')
        .expect(404);

      expect(res.body.error).toBe('Profile not found');
    });
  });

  describe('GET /api/profile', () => {
    it('should return all profiles', async () => {
      await Profile.create({ name: 'Profile 1' });
      await Profile.create({ name: 'Profile 2' });

      const res = await request(app)
        .get('/api/profile')
        .expect(200);

      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/profile/:id', () => {
    it('should update a profile', async () => {
      const profile = await Profile.create({
        name: 'Update Test',
        mbti: 'ISTP'
      });

      const res = await request(app)
        .put(`/api/profile/${profile._id}`)
        .send({ name: 'Updated Test' })
        .expect(200);

      expect(res.body.name).toBe('Updated Test');
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app)
        .put('/api/profile/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Test' })
        .expect(404);

      expect(res.body.error).toBe('Profile not found');
    });
  });

  describe('DELETE /api/profile/:id', () => {
    it('should delete a profile', async () => {
      const profile = await Profile.create({
        name: 'Delete Test',
        mbti: 'ISTP'
      });

      const res = await request(app)
        .delete(`/api/profile/${profile._id}`)
        .expect(200);

      expect(res.body.message).toBe('Profile deleted successfully');
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app)
        .delete('/api/profile/507f1f77bcf86cd799439011')
        .expect(404);

      expect(res.body.error).toBe('Profile not found');
    });
  });
});
