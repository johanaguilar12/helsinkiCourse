import { TextField, Button, Box } from '@mui/material'

const LoginForm = ({
  handleSubmit,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password
}) => {
  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="username"
            value={username}
            onChange={handleUsernameChange}
            size="small"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            size="small"
          />
        </Box>
        <Button variant="contained" color="primary" type="submit">
          login
        </Button>
      </form>
    </div>
  )
}

export default LoginForm
