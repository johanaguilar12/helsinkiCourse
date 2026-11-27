import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Link,
  Chip,
  Stack,
  Divider
} from '@mui/material'

const Blog = ({ blog, user, handleLike, handleRemove }) => {
  const navigate = useNavigate()

  if (!blog) {
    return null
  }

  const isAuthenticated = Boolean(user)
  const isCreator = Boolean(user && blog.user && blog.user.username === user.username)

  const onRemoveClick = async () => {
    const confirmed = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)
    if (!confirmed) {
      return
    }

    const removed = await handleRemove(blog)
    if (removed !== false) {
      navigate('/')
    }
  }

  return (
    <Card elevation={3} sx={{ mt: 3, maxWidth: 680 }} className="blog-detail">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {blog.title} — {blog.author}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Typography variant="body1">
            URL:{' '}
            <Link href={blog.url} target="_blank" rel="noopener noreferrer">
              {blog.url}
            </Link>
          </Typography>

          <div>
            <Chip label={`${blog.likes} likes`} color="primary" variant="outlined" />
          </div>

          {blog.user?.name && (
            <Typography variant="body2" color="text.secondary">
              added by {blog.user.name}
            </Typography>
          )}
        </Stack>
      </CardContent>

      {isAuthenticated && (
        <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleLike(blog)}
          >
            like
          </Button>
          {isCreator && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onRemoveClick}
            >
              remove
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}

export default Blog
