# Boo Personality Profiles & Comments System

A simple Node.js application for viewing user profiles and posting comments with personality type voting (MBTI, Enneagram, Zodiac).

## Features

- **User Profiles**: View profiles with descriptions and personality types.
- **Comment System**: 
  - Post comments with titles and content.
  - **Voting**: Tag comments with MBTI, Enneagram, and Zodiac personality votes.
  - **Likes**: Like/Unlike comments (likes persist across reloads).
  - **Sorting**: Sort comments by "Recent" or "Best" (most likes).
  - **Filtering**: Filter comments by personality vote type.
- **Categories**: Dynamic category management via sidebar.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (via `mongodb-memory-server` for zero-config persistence during runtime)
- **ODM**: Mongoose
- **Frontend**: EJS Templates, Vanilla CSS/JS
- **Testing**: Jest, Supertest

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   The application will run at [http://localhost:3001](http://localhost:3001).

## Usage

- **Home**: Redirects to the first available profile.
- **Create User**: Click "New Users" to create a user identity for commenting.
- **Profiles**: Navigate between profiles using the sidebar.
- **Comments**: Select a user, choose personality tags (optional), and post a comment!

## API Endpoints

### Profiles
- `GET /api/profile` - List all profiles
- `GET /api/profile/:id` - Get specific profile
- `POST /api/profile` - Create a profile
- `PUT /api/profile/:id` - Update a profile
- `DELETE /api/profile/:id` - Delete a profile

### Comments
- `GET /api/profiles/:id/comments` - Get comments for a profile (Supports query: `?sort=best`, `?filter=mbti`, `?userId=...`)
- `POST /api/profiles/:id/comments` - Create a comment
- `POST /api/comments/:id/like` - Like a comment
- `DELETE /api/comments/:id/like` - Unlike a comment

## Testing

Run the automated test suite:
```bash
npm test
```
Includes integration tests for Profiles, Comments, Users, and Categories.
