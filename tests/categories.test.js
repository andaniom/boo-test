'use strict';

const request = require('supertest');
const { app, db } = require('../app');
const Category = require('../models/Category');

describe('Category API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category', order: 1 });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Category');
      expect(res.body.order).toBe(1);
      expect(res.body._id).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ order: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is required');
    });

    it('should return 400 for duplicate category name', async () => {
      await Category.create({ name: 'Duplicate' });

      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Duplicate' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Category already exists');
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories sorted by order', async () => {
      await Category.insertMany([
        { name: 'Third', order: 3 },
        { name: 'First', order: 1 },
        { name: 'Second', order: 2 }
      ]);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].name).toBe('First');
      expect(res.body[1].name).toBe('Second');
      expect(res.body[2].name).toBe('Third');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a category by ID', async () => {
      const category = await Category.create({ name: 'Test' });

      const res = await request(app).get(`/api/categories/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test');
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).get('/api/categories/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const category = await Category.create({ name: 'Old Name' });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const category = await Category.create({ name: 'To Delete' });

      const res = await request(app).delete(`/api/categories/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Category deleted');

      const deleted = await Category.findById(category._id);
      expect(deleted).toBeNull();
    });
  });

  describe('POST /api/categories/seed', () => {
    it('should seed categories when database is empty', async () => {
      const res = await request(app).post('/api/categories/seed');

      expect(res.status).toBe(201);
      expect(res.body.count).toBe(17);

      const categories = await Category.find();
      expect(categories.length).toBe(17);
    });

    it('should not seed if categories exist', async () => {
      await Category.create({ name: 'Existing' });

      const res = await request(app).post('/api/categories/seed');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Categories already seeded');
    });
  });
});
