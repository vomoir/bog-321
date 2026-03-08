import { useState } from 'react'
import { Container, TextField, Button, Typography, Box } from '@mui/material'
import { useAuthStore } from '../store/useAuthStore'

export function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, error } = useAuthStore()

  const handleSignIn = () => {
    // Internally we use email format for Firebase Auth
    const email = name.includes('@') ? name : `${name.toLowerCase().replace(/\s+/g, '')}@soccer.com`
    signIn(email, password)
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name / Username"
            name="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSignIn}
          >
            Enter
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
