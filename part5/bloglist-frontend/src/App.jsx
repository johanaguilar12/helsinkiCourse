import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, Navigate, useMatch, useNavigate } from 'react-router-dom'
import { Container, AppBar, Toolbar, Button, Typography, Box } from '@mui/material'
import Blog from './components/Blog'
import BlogList from './components/BlogList'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const notificationTimeoutRef = useRef(null)
  const navigate = useNavigate()

  const notify = (message, type = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    setNotification({ message, type })
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null)
      notificationTimeoutRef.current = null
    }, 5000)
  }

  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const handleLogin = async credentials => {
    try {
      const loggedUser = await loginService.login(credentials)
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedUser)
      )
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      notify(`Welcome ${loggedUser.name}`, 'success')
      return true
    } catch {
      notify('wrong username or password', 'error')
      return false
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
    navigate('/')
  }

  const addBlog = async blogObject => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      notify(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`, 'success')
      return true
    } catch (error) {
      notify(error.response?.data?.error || 'failed to create blog', 'error')
      return false
    }
  }

  const handleLike = async blog => {
    try {
      const updatedBlogData = {
        user: blog.user?.id || blog.user,
        likes: blog.likes + 1,
        author: blog.author,
        title: blog.title,
        url: blog.url
      }

      const returnedBlog = await blogService.update(blog.id, updatedBlogData)
      const blogWithUser = returnedBlog.user && typeof returnedBlog.user === 'object'
        ? returnedBlog
        : { ...returnedBlog, user: blog.user }

      setBlogs(blogs.map(b => (b.id !== blog.id ? b : blogWithUser)))
    } catch (error) {
      notify(error.response?.data?.error || 'failed to update blog', 'error')
    }
  }

  const handleRemove = async blog => {
    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      notify(`Removed blog ${blog.title} by ${blog.author}`, 'success')
      return true
    } catch (error) {
      notify(error.response?.data?.error || 'failed to remove blog', 'error')
      return false
    }
  }

  const match = useMatch('/blogs/:id')
  const matchedBlog = match
    ? blogs.find(b => b.id === match.params.id)
    : null

  const navButtonStyle = {
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.25)'
    }
  }

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/" sx={navButtonStyle}>
            blogs
          </Button>
          {user && (
            <Button color="inherit" component={Link} to="/create" sx={navButtonStyle}>
              create new
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {user
            ? (
              <>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {user.name} logged in
                </Typography>
                <Button
                  color="inherit"
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                >
                  logout
                </Button>
              </>
            )
            : (
              <Button color="inherit" component={Link} to="/login" sx={navButtonStyle}>
                login
              </Button>
            )}
        </Toolbar>
      </AppBar>

      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} />} />
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blog={matchedBlog}
              user={user}
              handleLike={handleLike}
              handleRemove={handleRemove}
            />
          }
        />
        <Route
          path="/create"
          element={user ? <BlogForm createBlog={addBlog} /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/login"
          element={user ? <Navigate replace to="/" /> : <LoginForm onLogin={handleLogin} />}
        />
      </Routes>
    </Container>
  )
}

export default App
