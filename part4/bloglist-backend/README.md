# Blog list backend

Backend for the Full Stack Open blog list exercises.

## Setup

```bash
npm install
npm run dev
```

Configure `MONGODB_URI` in `.env` to use MongoDB Atlas or a local MongoDB instance.

The API is available at `http://localhost:3003/api/blogs`.

## Tests

Set `TEST_MONGODB_URI` in `.env` to a separate MongoDB database used only for tests.
The test suite clears and repopulates that database before each API test.

```bash
npm test
```
