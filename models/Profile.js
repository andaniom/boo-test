'use strict';

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  mbti: {
    type: String,
    default: ''
  },
  enneagram: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: ''
  },
  tritype: {
    type: Number,
    default: null
  },
  socionics: {
    type: String,
    default: ''
  },
  sloan: {
    type: String,
    default: ''
  },
  psyche: {
    type: String,
    default: ''
  },
  temperaments: {
    type: String,
    default: ''
  },
  profileTags: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: 'https://soulverse.boo.world/images/1.png'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
