import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, TextField, Button, Stack } from '@mui/material'

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async event => {
    event.preventDefault()
    const success = await onLogin({ username, password })
    if (success) {
      setUsername('')
      setPassword('')
      navigate('/')
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, maxWidth: 420 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Log in to application
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            login
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}

export default LoginForm
