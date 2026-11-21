# Phonebook backend

Implements Full Stack Open exercises 3.1-3.8. The phonebook data is stored in
memory and resets to the initial four people when the server restarts.

```bash
npm install
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

The default port is 3001. If another project is already using it, use a
different port, for example:

```bash
PORT=3002 npm run dev
```

Endpoints:

- `GET /api/persons` — list phonebook entries
- `GET /info` — show the entry count and request time
- `GET /api/persons/:id` — retrieve one entry or return 404
- `POST /api/persons` — create an entry after validating its name and number
- `DELETE /api/persons/:id` — remove an entry

Request samples are in `requests/persons.rest`. Morgan logs requests in tiny
format and includes POST bodies for the exercise; do not log sensitive data in
production.
