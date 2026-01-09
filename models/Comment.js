'use strict';

const mongoose = require('mongoose');

// Valid options for personality type votes
const MBTI_TYPES = [
  'INFP', 'INFJ', 'ENFP', 'ENFJ',
  'INTJ', 'INTP', 'ENTP', 'ENTJ',
  'ISFP', 'ISFJ', 'ESFP', 'ESFJ',
  'ISTP', 'ISTJ', 'ESTP', 'ESTJ'
];

const ENNEAGRAM_TYPES = [
  '1w2', '1w9', '2w1', '2w3', '3w2', '3w4',
  '4w3', '4w5', '5w4', '5w6', '6w5', '6w7',
  '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'
];

const ZODIAC_TYPES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const commentSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Optional personality type votes
  mbtiVote: {
    type: String,
    enum: [...MBTI_TYPES, null, ''],
    default: null
  },
  enneagramVote: {
    type: String,
    enum: [...ENNEAGRAM_TYPES, null, ''],
    default: null
  },
  zodiacVote: {
    type: String,
    enum: [...ZODIAC_TYPES, null, ''],
    default: null
  },
  // Denormalized like count for efficient sorting
  likesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
commentSchema.index({ profileId: 1, createdAt: -1 });
commentSchema.index({ profileId: 1, likesCount: -1 });

// Export constants for validation in routes
module.exports = mongoose.model('Comment', commentSchema);
module.exports.MBTI_TYPES = MBTI_TYPES;
module.exports.ENNEAGRAM_TYPES = ENNEAGRAM_TYPES;
module.exports.ZODIAC_TYPES = ZODIAC_TYPES;
