'use strict';

const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only like a comment once
likeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
