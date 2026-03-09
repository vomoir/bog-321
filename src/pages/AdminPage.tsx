import { useState, useEffect, useRef } from 'react'
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, TableContainer } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useVoteStore } from '../store/useVoteStore'
import { db, auth } from '../firebase/firebase'
import { collection, query, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { initializeApp, getApp, type FirebaseApp } from 'firebase/app'
import { firebaseConfig } from '../firebase/firebaseConfig'
import Papa from 'papaparse'

export function AdminPage() {
  const { totalVotes, fetchTotalVotes } = useVoteStore()
  const [users, setUsers] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTotalVotes()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const q = query(collection(db, 'users'))
    const querySnapshot = await getDocs(q)
    const userList: any[] = []
    querySnapshot.forEach((doc) => {
      userList.push({ id: doc.id, ...doc.data() })
    })
    setUsers(userList)
  }

  const createUserAccount = async (name: string, password: string) => {
    const email = `${name.toLowerCase().replace(/\s+/g, '')}@soccer.com`
    let secondaryApp: FirebaseApp
    try {
      secondaryApp = getApp('Secondary')
    } catch (e) {
      secondaryApp = initializeApp(firebaseConfig, 'Secondary')
    }
    const secondaryAuth = getAuth(secondaryApp)
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      name: name,
      role: 'user'
    })
  }

  const handleAddUser = async () => {
    try {
      await createUserAccount(newName, newPassword)
      setNewName('')
      setNewPassword('')
      fetchUsers()
      alert('User created successfully!')
    } catch (error) {
      console.error('Error adding user:', error)
      alert((error as Error).message)
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let successCount = 0
        let errorCount = 0

        for (const row of results.data as any) {
          const { first_name, last_name, password } = row
          if (first_name && last_name && password) {
            try {
              await createUserAccount(`${first_name} ${last_name}`, password)
              successCount++
            } catch (err) {
              console.error(`Error creating user ${first_name} ${last_name}:`, err)
              errorCount++
            }
          }
        }
        
        fetchUsers()
        alert(`Import complete. Success: ${successCount}, Errors: ${errorCount}`)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? (This only removes them from Firestore)')) {
      await deleteDoc(doc(db, 'users', userId))
      fetchUsers()
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Password reset email sent!')
    } catch (error) {
      alert((error as Error).message)
    }
  }

  const playerUsers = users.filter(u => u.role === 'user')

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Total Votes</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player Name</TableCell>
                  <TableCell align="right">Total Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerUsers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell align="right">{totalVotes[player.id] || 0}</TableCell>
                  </TableRow>
                ))}
                {playerUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No players found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>User Management</Typography>
          
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Import CSV
              <input
                type="file"
                hidden
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVUpload}
              />
            </Button>
            <Typography variant="caption" color="textSecondary">
              CSV Header: first_name, last_name, password
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
            />
            <TextField
              label="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={handleAddUser}>Add User</Button>
          </Box>
          <List>
            {users.map((u) => (
              <ListItem key={u.id} divider
                secondaryAction={
                  <Box>
                    <Button onClick={() => handleResetPassword(u.email)}>Reset Password</Button>
                    <IconButton edge="end" onClick={() => handleDeleteUser(u.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText primary={u.name || u.email} secondary={u.role} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Container>
  )
}
