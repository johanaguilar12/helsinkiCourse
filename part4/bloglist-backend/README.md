# Blog list backend

Backend for the Full Stack Open blog list exercises.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Configure `MONGODB_URI` and `TEST_MONGODB_URI` in `.env` for MongoDB Atlas or
local MongoDB, and replace the example `SECRET` with a private random value.
The test URI must point to a database separate from development because API
tests clear and repopulate its collections.

The API is available at `http://localhost:3003/api/blogs`.

## API

- `GET /api/blogs` lists blogs.
- `POST /api/blogs` creates a blog (requires a bearer token).
- `PUT /api/blogs/:id` updates a blog.
- `DELETE /api/blogs/:id` deletes a blog (creator only; requires a bearer token).
- `POST /api/users` creates a user with `username`, `password`, and optional `name`.
- `GET /api/users` lists users and their populated blogs.
- `POST /api/login` authenticates a user and returns a JWT.

Create a user, log in, then send `Authorization: Bearer <token>` with blog POST
and DELETE requests. Passwords are stored as bcrypt hashes and never returned.
The `SECRET` environment variable must be set in production as well.

## Tests

Set `TEST_MONGODB_URI` in `.env` to a separate MongoDB database used only for tests.
The test suite clears and repopulates that database before each API test.

```bash
npm test
```
