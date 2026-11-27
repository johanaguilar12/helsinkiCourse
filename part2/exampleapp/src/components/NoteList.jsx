import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material'

const NoteList = ({ notes, user, loginForm }) => {
  const [showAll, setShowAll] = useState(true)

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)

  return (
    <div>
      <h2>Notes</h2>
      {!user && loginForm()}
      {user && <p>{user.name} logged in</p>}

      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <Button variant="outlined" size="small" onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>content</TableCell>
              <TableCell>user</TableCell>
              <TableCell>important</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notesToShow.map(note => (
              <TableRow key={note.id}>
                <TableCell>
                  <Link to={`/notes/${note.id}`}>
                    {note.content}
                  </Link>
                </TableCell>
                <TableCell>
                  {note.user?.name}
                </TableCell>
                <TableCell>
                  {note.important ? 'yes' : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default NoteList
