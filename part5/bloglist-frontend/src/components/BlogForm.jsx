import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, TextField, Button, Stack } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  const addBlog = async event => {
    event.preventDefault()
    const created = await createBlog({
      title,
      author,
      url
    })

    if (created !== false) {
      setTitle('')
      setAuthor('')
      setUrl('')
      navigate('/')
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, maxWidth: 520 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Create new blog
      </Typography>
      <form onSubmit={addBlog}>
        <Stack spacing={2}>
          <TextField
            label="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="url"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            create
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}

export default BlogForm
