import { useCallback, useEffect, useState } from 'react'
import Note from './components/Note'
import noteService from './services/notes'
import userService from './services/users'

const App = () => {
  const [noteList, setNoteList] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [registering, setRegistering] = useState(false)
  const [authError, setAuthError] = useState('')
  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState('')

  const refreshUsers = useCallback(() => userService
    .getAll()
    .then(registeredUsers => {
      setUsers(registeredUsers)
      setUsersError('')
    })
    .catch(error => {
      console.error('Failed to load users:', error)
      setUsersError('Could not load users from the server.')
    }), [])

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => setNoteList(initialNotes))
      .catch(error => {
        console.error('Failed to load notes from the server:', error)
        setLoadError('Could not load notes. Make sure the Notes backend is running.')
      })
      .finally(() => setLoading(false))
    refreshUsers()
  }, [refreshUsers])

  const addNote = event => {
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNoteList(currentNotes => currentNotes.concat(returnedNote))
        setNewNote('')
        refreshUsers()
      })
      .catch(error => {
        console.error('Failed to save the note:', error)
        setLoadError(error.response?.data?.error || 'Could not save the note')
      })
  }

  const toggleImportanceOf = id => {
    const note = noteList.find(currentNote => currentNote.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNoteList(currentNotes =>
          currentNotes.map(currentNote =>
            currentNote.id !== id ? currentNote : returnedNote
          )
        )
        refreshUsers()
      })
      .catch(error => {
        console.error('Failed to update the note:', error)
        setLoadError(error.response?.data?.error || `The note '${note.content}' could not be updated`)
      })
  }

  const handleAuthentication = async event => {
    event.preventDefault()
    setAuthError('')

    try {
      if (registering) {
        await userService.create({ username, name, password })
      }

      const authenticatedUser = await userService.login({ username, password })
      noteService.setToken(authenticatedUser.token)
      setUser(authenticatedUser)
      await refreshUsers()
      setUsername('')
      setName('')
      setPassword('')
    } catch (error) {
      console.error('Authentication failed:', error)
      setAuthError(error.response?.data?.error || 'Authentication failed')
    }
  }

  const logout = () => {
    noteService.setToken(null)
    setUser(null)
  }

  const notesToShow = showAll
    ? noteList
    : noteList.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      {loading && <p>Loading notes...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {user
        ? (
          <p>
            Signed in as {user.name}{' '}
            <button onClick={logout}>log out</button>
          </p>
        )
        : (
          <section>
            <h2>{registering ? 'Create account' : 'Log in'}</h2>
            <form onSubmit={handleAuthentication}>
              <div>
                <label>
                  Username
                  <input
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                    autoComplete="username"
                  />
                </label>
              </div>
              {registering && (
                <div>
                  <label>
                    Name
                    <input
                      value={name}
                      onChange={event => setName(event.target.value)}
                      autoComplete="name"
                    />
                  </label>
                </div>
              )}
              <div>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete={registering ? 'new-password' : 'current-password'}
                  />
                </label>
              </div>
              <button type="submit">{registering ? 'create account' : 'log in'}</button>
            </form>
            {authError && <p role="alert">{authError}</p>}
            <button onClick={() => {
              setRegistering(!registering)
              setAuthError('')
            }}>
              {registering ? 'back to login' : 'create a new account'}
            </button>
          </section>
        )}
      <button onClick={() => setShowAll(!showAll)}>
        show {showAll ? 'important' : 'all'}
      </button>
      <ul>
        {notesToShow.map(note => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={user?.id === note.user?.id
              ? () => toggleImportanceOf(note.id)
              : null}
          />
        ))}
      </ul>
      {user
        ? (
          <form onSubmit={addNote}>
            <input
              value={newNote}
              onChange={event => setNewNote(event.target.value)}
              aria-label="New note"
            />
            <button type="submit">save</button>
          </form>
        )
        : <p>Log in to create notes or change their importance.</p>}
      <section>
        <h2>Users and their notes</h2>
        {usersError && <p role="alert">{usersError}</p>}
        {users.length === 0 && !usersError
          ? <p>No registered users yet.</p>
          : (
            <ul>
              {users.map(registeredUser => (
                <li key={registeredUser.id}>
                  <strong>{registeredUser.name}</strong> (@{registeredUser.username})
                  {registeredUser.notes.length === 0
                    ? <p>No notes yet.</p>
                    : (
                      <ul>
                        {registeredUser.notes.map(note => (
                          <li key={note.id}>
                            {note.content} ({note.important ? 'important' : 'not important'})
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}

export default App