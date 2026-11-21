import { useEffect, useState } from 'react'
import Note from './components/Note'
import noteService from './services/notes'

const App = () => {
  const [noteList, setNoteList] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => setNoteList(initialNotes))
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
    }

    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNoteList(noteList.concat(returnedNote))
        setNewNote('')
      })
      .catch(error => {
        console.error('Failed to save the note:', error)
        window.alert('Could not save the note')
      })
  }

  const toggleImportanceOf = id => {
    const note = noteList.find(currentNote => currentNote.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNoteList(
          noteList.map(currentNote =>
            currentNote.id !== id ? currentNote : returnedNote
          )
        )
      })
      .catch(error => {
        console.error('Failed to update the note:', error)
        window.alert(`The note '${note.content}' could not be updated`)
      })
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
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
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