'use strict';

const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

// Get all categories (sorted by order)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, url, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const category = new Category({
      name,
      url: url || '#',
      order: order || 0
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, url, order } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, url, order },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed categories (for initial setup)
router.post('/seed', async (req, res) => {
  try {
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Categories already seeded', count: existingCount });
    }
    
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
    res.status(201).json({ message: 'Categories seeded', count: defaultCategories.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
