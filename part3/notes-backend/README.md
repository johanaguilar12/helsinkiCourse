# Notes backend

Express and MongoDB API for the Full Stack Open notes application. Users have
password hashes, notes are linked to their creators, and note creation,
updates, and deletion require a valid login token. Only a note's creator may
update or delete it.

## Setup

Copy `.env.example` to `.env`, then configure `MONGODB_URI`,
`TEST_MONGODB_URI`, and a private `JWT_SECRET`. Keep the test database
separate: the test suite clears its collections before each test.

```bash
npm install
npm run dev
```

The server listens on port 3001 by default. Use `PORT=3002 npm run dev` if
another process is already using that port.

## API

- `POST /api/users` — create a user with `username`, `name`, and `password`
- `GET /api/users` — list users and their populated notes
- `POST /api/login` — authenticate and return a one-hour bearer token
- `GET /api/notes` — list notes with populated creator details
- `GET /api/notes/:id` — retrieve one note
- `POST /api/notes` — create a note (requires bearer token)
- `PUT /api/notes/:id` — update an owned note (requires bearer token)
- `DELETE /api/notes/:id` — delete an owned note (requires bearer token)

Example request flows for VS Code REST Client are in `requests/notes.rest`.

## Tests

```bash
npm test
```

The tests use `TEST_MONGODB_URI`, never the development database.

## Frontend

Run the backend with `npm run dev` and the frontend with
`npm --prefix ../../part2/exampleapp run dev`. To build the frontend into
`dist`, run `npm run build:ui`.

For Render, use `part3/notes-backend` as the root directory, configure
`MONGODB_URI` and `JWT_SECRET` as environment variables, use
`npm install && npm run build:ui` as the build command, and `npm start` as the
start command.
