'use strict';

const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Category = require('../models/Category');

// Initial seed data
// Initial seed data
const seedProfiles = [
  {
    name: "Elon Reeve Musk",
    description: "Elon Reeve Musk FRS (/ˈiːlɒn/; born June 28, 1971) is a technology entrepreneur, investor, and engineer. He holds South African, Canadian, and U.S. citizenship and is the founder, CEO, and lead designer of SpaceX; co-founder, CEO, and product architect of Tesla, Inc.; co-founder and CEO of Neuralink; founder of The Boring Company; co-founder and co-chairman of OpenAI; and co-founder of PayPal. As of February 2021, Musk's net worth stands at $184 billion, making him the 2nd richest person in the world.",
    mbti: "ISFJ",
    enneagram: "9w3",
    variant: "sp/so",
    tritype: 725,
    socionics: "SEE",
    sloan: "RCOEN",
    psyche: "FEVL",
    temperaments: "Phlegmatic [Dominant]",
    profileTags: ["Business", "Technology"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
  },
  {
    name: "Alan Turing",
    description: "Alan Mathison Turing OB FRS (23 June 1912 – 7 June 1954) was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. He was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer.",
    mbti: "INTP",
    enneagram: "5w6",
    variant: "so/sp",
    tritype: 513,
    socionics: "LII",
    sloan: "RCOEI",
    psyche: "LVEF",
    temperaments: "Melancholic-Phlegmatic",
    profileTags: ["Science", "Math", "Technology"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/440px-Alan_Turing_Aged_16.jpg",
  },
  {
    name: "Marie Curie",
    description: "Marie Salomea Skłodowska-Curie (7 November 1867 – 4 July 1934) was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person and the only woman to win the Nobel Prize twice, and the only person to win the Nobel Prize in two different scientific fields.",
    mbti: "INTJ",
    enneagram: "5w4",
    variant: "sp/sx",
    tritype: 514,
    socionics: "ILI",
    sloan: "RCOEI",
    psyche: "VLEF",
    temperaments: "Melancholic-Choleric",
    profileTags: ["Science", "Physics", "Chemistry"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg",
  }
];

// Seed the database with initial profiles if empty
async function seedDatabase() {
  const count = await Profile.countDocuments();
  if (count === 0) {
    await Profile.insertMany(seedProfiles);
    console.log('Seeded database with initial profiles');
  }
}

module.exports = function() {
  // Create a new profile
  router.post('/api/profile', async (req, res) => {
    try {
      const profileData = req.body;
      
      if (!profileData.name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const profile = new Profile(profileData);
      await profile.save();
      
      res.status(201).json(profile);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update a profile
  router.put('/api/profile/:id', async (req, res) => {
    try {
      const profileData = req.body;
      
      if (!profileData.name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const profile = await Profile.findByIdAndUpdate(req.params.id, profileData, { new: true });
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a profile
  router.delete('/api/profile/:id', async (req, res) => {
    try {
      const profile = await Profile.findByIdAndDelete(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get profile by ID (JSON API)
  router.get('/api/profile/:id', async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid profile ID' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // List all profiles (JSON API)
  router.get('/api/profile', async (req, res) => {
    try {
      const profiles = await Profile.find().sort({ createdAt: -1 });
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to render profile page
  async function renderProfile(req, res, id = null) {
    try {
      let profile;
      if (id) {
        profile = await Profile.findById(id);
      } else {
        profile = await Profile.findOne().sort({ createdAt: 1 });
      }
      
      if (!profile) {
        return res.status(404).render('error', { 
          message: 'Profile not found',
          error: { status: 404 }
        });
      }
      
      const categories = await Category.find().sort({ order: 1 });
      const profiles = await Profile.find().sort({ createdAt: 1 });
      
      res.render('profile_template', { profile, categories, profiles });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).render('error', { 
          message: 'Profile not found',
          error: { status: 404 } 
        });
      }
      res.status(500).render('error', { 
        message: 'Server error',
        error: { status: 500 }
      });
    }
  }

  // Default route - show first profile
  router.get('/', (req, res) => renderProfile(req, res));
  
  // Specific profile route
  router.get('/profile/:id', (req, res) => renderProfile(req, res, req.params.id));

  return { router, seedDatabase };
}
