'use strict';

const request = require('supertest');
const { app, db } = require('../app');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

describe('Comment API', () => {
  let testProfile;
  let testUser;
  let testUser2;

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
    
    // Create test data
    testProfile = await Profile.create({
      name: 'Elon Musk',
      mbti: 'INTJ'
    });
    
    testUser = await User.create({ name: 'Commenter 1' });
    testUser2 = await User.create({ name: 'Commenter 2' });
  });

  describe('POST /api/profiles/:profileId/comments', () => {
    it('should create a comment', async () => {
      const res = await request(app)
        .post(`/api/profiles/${testProfile._id}/comments`)
        .send({
          userId: testUser._id,
          title: 'My Analysis',
          content: 'I think this personality type fits!'
        })
        .expect(201);

      expect(res.body.title).toBe('My Analysis');
      expect(res.body.content).toBe('I think this personality type fits!');
      expect(res.body.likesCount).toBe(0);
    });

    it('should create a comment with personality votes', async () => {
      const res = await request(app)
        .post(`/api/profiles/${testProfile._id}/comments`)
        .send({
          userId: testUser._id,
          title: 'Personality Vote',
          content: 'Here are my votes',
          mbtiVote: 'ENTP',
          enneagramVote: '8w7',
          zodiacVote: 'Gemini'
        })
        .expect(201);

      expect(res.body.mbtiVote).toBe('ENTP');
      expect(res.body.enneagramVote).toBe('8w7');
      expect(res.body.zodiacVote).toBe('Gemini');
    });

    it('should reject invalid MBTI vote', async () => {
      const res = await request(app)
        .post(`/api/profiles/${testProfile._id}/comments`)
        .send({
          userId: testUser._id,
          title: 'Bad Vote',
          content: 'Invalid type',
          mbtiVote: 'INVALID'
        })
        .expect(400);

      expect(res.body.error.toLowerCase()).toContain('validation');
    });

    it('should require userId, title, and content', async () => {
      const res = await request(app)
        .post(`/api/profiles/${testProfile._id}/comments`)
        .send({})
        .expect(400);

      expect(res.body.error).toContain('required');
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app)
        .post('/api/profiles/507f1f77bcf86cd799439011/comments')
        .send({
          userId: testUser._id,
          title: 'Test',
          content: 'Test'
        })
        .expect(404);

      expect(res.body.error).toBe('Profile not found');
    });
  });

  describe('GET /api/profiles/:profileId/comments', () => {
    beforeEach(async () => {
      // Create comments with different times and like counts
      const comment1 = await Comment.create({
        profileId: testProfile._id,
        userId: testUser._id,
        title: 'First Comment',
        content: 'Posted first',
        mbtiVote: 'INTJ',
        likesCount: 5
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const comment2 = await Comment.create({
        profileId: testProfile._id,
        userId: testUser2._id,
        title: 'Second Comment',
        content: 'Posted second',
        enneagramVote: '5w4',
        likesCount: 10
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const comment3 = await Comment.create({
        profileId: testProfile._id,
        userId: testUser._id,
        title: 'Third Comment',
        content: 'Posted third',
        zodiacVote: 'Capricorn',
        likesCount: 2
      });
    });

    it('should return comments sorted by recent (default)', async () => {
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].title).toBe('Third Comment');
      expect(res.body[2].title).toBe('First Comment');
    });

    it('should return comments sorted by best (most likes)', async () => {
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments?sort=best`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].title).toBe('Second Comment');
      expect(res.body[0].likesCount).toBe(10);
    });

    it('should filter comments by MBTI votes', async () => {
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments?filter=mbti`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].mbtiVote).toBe('INTJ');
    });

    it('should filter comments by Enneagram votes', async () => {
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments?filter=enneagram`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].enneagramVote).toBe('5w4');
    });

    it('should filter comments by Zodiac votes', async () => {
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments?filter=zodiac`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].zodiacVote).toBe('Capricorn');
    });

    it('should return isLiked=true for comments liked by the user', async () => {
      // Create a comment
      const comment = await Comment.create({
        profileId: testProfile._id,
        userId: testUser2._id,
        title: 'To be liked',
        content: 'Like me',
      });

      // Like it with testUser
      await Like.create({
        userId: testUser._id,
        commentId: comment._id
      });

      // Fetch comments as testUser
      const res = await request(app)
        .get(`/api/profiles/${testProfile._id}/comments?userId=${testUser._id}`)
        .expect(200);

      // Find the comment
      const returnedComment = res.body.find(c => c._id === comment._id.toString());
      expect(returnedComment).toBeDefined();
      expect(returnedComment.isLiked).toBe(true);

      // Verify other comments are not liked (or undefined/false)
      const otherComment = res.body.find(c => c._id !== comment._id.toString());
      if (otherComment) {
        expect(!!otherComment.isLiked).toBe(false);
      }
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app)
        .get('/api/profiles/507f1f77bcf86cd799439011/comments')
        .expect(404);

      expect(res.body.error).toBe('Profile not found');
    });
  });

  describe('GET /api/comments/:id', () => {
    it('should return a single comment', async () => {
      const comment = await Comment.create({
        profileId: testProfile._id,
        userId: testUser._id,
        title: 'Single Comment',
        content: 'Get this one'
      });

      const res = await request(app)
        .get(`/api/comments/${comment._id}`)
        .expect(200);

      expect(res.body.title).toBe('Single Comment');
    });

    it('should return 404 for non-existent comment', async () => {
      const res = await request(app)
        .get('/api/comments/507f1f77bcf86cd799439011')
        .expect(404);

      expect(res.body.error).toBe('Comment not found');
    });
  });

  describe('POST /api/comments/:id/like', () => {
    let testComment;

    beforeEach(async () => {
      testComment = await Comment.create({
        profileId: testProfile._id,
        userId: testUser._id,
        title: 'Likeable Comment',
        content: 'Like me!'
      });
    });

    it('should like a comment', async () => {
      const res = await request(app)
        .post(`/api/comments/${testComment._id}/like`)
        .send({ userId: testUser2._id })
        .expect(201);

      expect(res.body.likesCount).toBe(1);

      // Verify count in database
      const updated = await Comment.findById(testComment._id);
      expect(updated.likesCount).toBe(1);
    });

    it('should not allow duplicate likes', async () => {
      await request(app)
        .post(`/api/comments/${testComment._id}/like`)
        .send({ userId: testUser2._id })
        .expect(201);

      const res = await request(app)
        .post(`/api/comments/${testComment._id}/like`)
        .send({ userId: testUser2._id })
        .expect(400);

      expect(res.body.error).toBe('Already liked this comment');
    });

    it('should require userId', async () => {
      const res = await request(app)
        .post(`/api/comments/${testComment._id}/like`)
        .send({})
        .expect(400);

      expect(res.body.error).toBe('userId is required');
    });
  });

  describe('DELETE /api/comments/:id/like', () => {
    let testComment;

    beforeEach(async () => {
      testComment = await Comment.create({
        profileId: testProfile._id,
        userId: testUser._id,
        title: 'Liked Comment',
        content: 'Already liked',
        likesCount: 1
      });
      
      await Like.create({
        userId: testUser2._id,
        commentId: testComment._id
      });
    });

    it('should unlike a comment', async () => {
      const res = await request(app)
        .delete(`/api/comments/${testComment._id}/like`)
        .send({ userId: testUser2._id })
        .expect(200);

      expect(res.body.likesCount).toBe(0);

      // Verify count in database
      const updated = await Comment.findById(testComment._id);
      expect(updated.likesCount).toBe(0);
    });

    it('should return 404 if like does not exist', async () => {
      const res = await request(app)
        .delete(`/api/comments/${testComment._id}/like`)
        .send({ userId: testUser._id }) // Different user
        .expect(404);

      expect(res.body.error).toBe('Like not found');
    });
  });
});
