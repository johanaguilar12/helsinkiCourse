import { Alert } from '@mui/material'

const Notification = ({ notification }) => {
  if (!notification) {
    return null
  }

  return (
    <Alert
      severity={notification.type === 'error' ? 'error' : 'success'}
      sx={{ my: 2 }}
    >
      {notification.message}
    </Alert>
  )
}

export default Notification
