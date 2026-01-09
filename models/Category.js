'use strict';

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    default: '#'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Sort by order field
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
