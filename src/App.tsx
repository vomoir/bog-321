import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Container, Typography, AppBar, Toolbar, Button, Box } from '@mui/material'
import { VotingPage } from './pages/VotingPage'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const { user, role, signOut, loading } = useAuthStore()

  if (loading) return null

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Soccer Vote
          </Typography>
          {user && (
            <Box>
              <Button color="inherit" component={Link} to="/">
                Vote
              </Button>
              {role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin
                </Button>
              )}
              <Button color="inherit" onClick={signOut}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <VotingPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
          />
        </Routes>
      </Container>
    </Router>
  )
}

export default App

