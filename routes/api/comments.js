'use strict';

const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Like = require('../../models/Like');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// Create a comment on a profile
router.post('/profiles/:profileId/comments', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { userId, title, content, mbtiVote, enneagramVote, zodiacVote } = req.body;
    
    // Validate required fields
    if (!userId || !title || !content) {
      return res.status(400).json({ error: 'userId, title, and content are required' });
    }
    
    // Verify profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const comment = new Comment({
      profileId,
      userId,
      title,
      content,
      mbtiVote: mbtiVote || null,
      enneagramVote: enneagramVote || null,
      zodiacVote: zodiacVote || null
    });
    
    await comment.save();
    
    // Populate user info in response
    await comment.populate('userId', 'name');
    
    res.status(201).json(comment);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a profile with sorting and filtering
router.get('/profiles/:profileId/comments', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { sort = 'recent', filter } = req.query;
    
    // Verify profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Build query
    let query = Comment.find({ profileId });
    
    // Apply filter by personality type
    if (filter) {
      switch (filter.toLowerCase()) {
        case 'mbti':
          query = query.where('mbtiVote').ne(null);
          break;
        case 'enneagram':
          query = query.where('enneagramVote').ne(null);
          break;
        case 'zodiac':
          query = query.where('zodiacVote').ne(null);
          break;
      }
    }
    
    // Apply sorting
    if (sort === 'best') {
      query = query.sort({ likesCount: -1, createdAt: -1 });
    } else {
      // Default to recent
      query = query.sort({ createdAt: -1 });
    }
    
    const commentsDocs = await query.populate('userId', 'name');
    const comments = commentsDocs.map(doc => doc.toObject());
    
    // If userId provided, check for likes
    if (req.query.userId) {
      try {
        const userLikes = await Like.find({ 
          userId: req.query.userId,
          commentId: { $in: comments.map(c => c._id) }
        });
        
        const likedCommentIds = new Set(userLikes.map(l => l.commentId.toString()));
        
        comments.forEach(comment => {
          comment.isLiked = likedCommentIds.has(comment._id.toString());
        });
      } catch (err) {
        // Continue without isLiked if error
      }
    }
    
    res.json(comments);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get a single comment by ID
router.get('/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('userId', 'name');
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Like a comment
router.post('/comments/:id/like', async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Verify comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({ userId, commentId });
    if (existingLike) {
      return res.status(400).json({ error: 'Already liked this comment' });
    }
    
    // Create like and increment count
    const like = new Like({ userId, commentId });
    await like.save();
    
    comment.likesCount += 1;
    await comment.save();
    
    res.status(201).json({ message: 'Comment liked', likesCount: comment.likesCount });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Unlike a comment
router.delete('/comments/:id/like', async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Find and delete like
    const like = await Like.findOneAndDelete({ userId, commentId });
    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }
    
    // Decrement count
    const comment = await Comment.findById(commentId);
    if (comment) {
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await comment.save();
    }
    
    res.json({ message: 'Comment unliked', likesCount: comment ? comment.likesCount : 0 });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
