import { useState, useEffect } from 'react'
import { Routes, Route, Link, useMatch } from 'react-router-dom'
import { Container, AppBar, Toolbar, Button } from '@mui/material'
import Note from './components/Note'
import NoteList from './components/NoteList'
import Home from './components/Home'
import Notification from './components/Notification'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import NoteForm from './components/NoteForm'
import Togglable from './components/Togglable'
import noteService from './services/notes'
import loginService from './services/login'

const App = () => {
  const [notes, setNotes] = useState([])
  const [notification, setNotification] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const notify = (text, type = 'success') => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(loggedUser)
      noteService.setToken(loggedUser.token)
    }
  }, [])

  const addNote = noteObject => {
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        notify(`Note '${returnedNote.content}' added!`, 'success')
      })
      .catch(error => {
        notify(error.response?.data?.error || 'could not create note', 'error')
      })
  }

  const toggleImportanceOf = id => {
    const targetNote = notes.find(n => n.id === id)
    const changedNote = { ...targetNote, important: !targetNote.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(n => (n.id !== id ? n : returnedNote)))
      })
      .catch(error => {
        notify(
          error.response?.data?.error || `Note '${targetNote.content}' was already removed from server`,
          'error'
        )
      })
  }

  const deleteNote = id => {
    noteService
      .remove(id)
      .then(() => {
        setNotes(notes.filter(n => n.id !== id))
      })
      .catch(error => {
        notify(error.response?.data?.error || 'could not delete note', 'error')
      })
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(loggedUser)
      )
      noteService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      notify('wrong credentials', 'error')
    }
  }

  const loginForm = () => (
    <Togglable buttonLabel="login">
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  const match = useMatch('/notes/:id')
  const note = match
    ? notes.find(n => n.id === match.params.id)
    : null

  const navStyle = {
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.3)'
    }
  }

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/" sx={navStyle}>
            home
          </Button>
          <Button color="inherit" component={Link} to="/notes" sx={navStyle}>
            notes
          </Button>
          <Button color="inherit" component={Link} to="/create" sx={navStyle}>
            new note
          </Button>
        </Toolbar>
      </AppBar>

      <Notification notification={notification} />

      <Routes>
        <Route
          path="/notes/:id"
          element={
            <Note
              note={note}
              toggleImportanceOf={toggleImportanceOf}
              deleteNote={deleteNote}
            />
          }
        />
        <Route
          path="/notes"
          element={<NoteList notes={notes} user={user} loginForm={loginForm} />}
        />
        <Route
          path="/create"
          element={<NoteForm createNote={addNote} />}
        />
        <Route path="/" element={<Home />} />
      </Routes>

      <Footer />
    </Container>
  )
}

export default App
