# Notes

This example loads its initial notes from JSON Server and demonstrates adding notes locally and filtering important notes.

Run the API and the React app in separate terminals from this directory:

```bash
npm run server
npm run dev
```

The API serves the notes at `http://localhost:3001/notes`. New notes are currently kept only in the app's state and are not saved to `db.json`.
