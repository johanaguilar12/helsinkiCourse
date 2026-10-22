import { useEffect, useState } from 'react'
import axios from 'axios'
import Note from './components/Note'

const App = () => {
  const [noteList, setNoteList] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    axios
      .get('http://localhost:3001/notes')
      .then(response => setNoteList(response.data))
      .catch(error => {
        console.error('Failed to load notes from the server:', error)
        setLoadError('Could not load notes. Make sure the JSON Server is running.')
      })
      .finally(() => setLoading(false))
  }, [])

  const addNote = event => {
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
      id: Math.max(0, ...noteList.map(note => note.id)) + 1,
    }

    setNoteList(noteList.concat(noteObject))
    setNewNote('')
  }

  const notesToShow = showAll
    ? noteList
    : noteList.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      {loading && <p>Loading notes...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      <button onClick={() => setShowAll(!showAll)}>
        show {showAll ? 'important' : 'all'}
      </button>
      <ul>
        {notesToShow.map(note => (
          <Note key={note.id} note={note} />
        ))}
      </ul>
      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App