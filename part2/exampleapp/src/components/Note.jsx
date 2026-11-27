import { useNavigate } from 'react-router-dom'
import { Button, Stack } from '@mui/material'

const Note = ({ note, toggleImportanceOf, deleteNote }) => {
  const navigate = useNavigate()

  if (!note) {
    return null
  }

  const label = note.important
    ? 'make not important'
    : 'make important'

  const handleDelete = () => {
    if (window.confirm(`Delete note "${note.content}"?`)) {
      deleteNote(note.id)
      navigate('/notes')
    }
  }

  return (
    <div className="note">
      <h2>{note.content}</h2>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={() => toggleImportanceOf(note.id)}>
          {label}
        </Button>
        {deleteNote && (
          <Button variant="outlined" color="error" size="small" onClick={handleDelete}>
            delete
          </Button>
        )}
      </Stack>
    </div>
  )
}

export default Note
