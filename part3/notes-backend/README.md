# Notes backend

A small Express server for the first backend chapter in Part 3. Notes are stored
in memory, so restarting the server restores the initial three notes.
The CORS middleware allows the Part 2 frontend, served from a different local
port, to access the API.

```bash
npm install
npm start
```

The server listens on port 3001 by default. If that port is in use, start it
with another port:

```bash
PORT=3002 npm start
```

Endpoints:

- `GET /` — hello world
- `GET /api/notes` — list all notes
- `GET /api/notes/:id` — retrieve one note, or return 404
- `POST /api/notes` — create a note; `content` is required
- `DELETE /api/notes/:id` — remove a note

Requests for the VS Code REST Client extension are in `requests/notes.rest`.

To use it with the notes frontend, run `npm start` here and `npm run dev` in
`part2/exampleapp`. In development, the frontend proxies `/api` requests to
this backend.

To build the frontend into this backend's `dist` directory, run:

```bash
npm run build:ui
```

Once built, Express serves the frontend at `/` and continues to serve the API
under `/api/notes`. For Render, use `part3/notes-backend` as the root directory,
`npm install && npm run build:ui` as the build command, and `npm start` as the
start command.
