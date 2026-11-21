# Notes

This example loads notes from the Express backend in `part3/notes-backend` and
demonstrates adding notes and filtering important notes.

Run the backend and the React app in separate terminals:

```bash
cd part3/notes-backend
npm start
```

```bash
cd part2/exampleapp
npm run dev
```

The API is available at `http://localhost:3001/api/notes`. The backend stores
notes in memory, so changes reset when it restarts. Importance updates are not
implemented in the backend yet.

The Vite development server proxies `/api` requests to the backend on port
3001. In production, the backend serves the frontend build from its `dist`
directory.
