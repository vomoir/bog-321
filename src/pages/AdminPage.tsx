import { useState, useEffect, useRef } from 'react'
import { 
  Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, Button, List, ListItem, ListItemText, IconButton, 
  TableContainer, Tabs, Tab, Dialog, DialogTitle, DialogContent, 
  DialogActions, Avatar, CircularProgress 
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import EditIcon from '@mui/icons-material/Edit'
import { useVoteStore } from '../store/useVoteStore'
import { db, auth, storage } from '../firebase/firebase'
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { initializeApp, getApp, type FirebaseApp } from 'firebase/app'
import { firebaseConfig } from '../firebase/firebaseConfig'
import Papa from 'papaparse'
import { useSnackbar } from 'notistack'

interface UserData {
  id: string
  email: string
  name: string
  aka?: string
  role: 'admin' | 'user'
  photoURL?: string
}

export function AdminPage() {
  const { totalVotes, fetchTotalVotes } = useVoteStore()
  const { enqueueSnackbar } = useSnackbar()
  const [users, setUsers] = useState<UserData[]>([])
  const [tabValue, setTabValue] = useState(0)
  
  // New user form state
  const [newName, setNewName] = useState('')
  const [newAka, setNewAka] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit dialog state
  const [editUser, setEditUser] = useState<UserData | null>(null)
  const [editName, setEditName] = useState('')
  const [editAka, setEditAka] = useState('')
  const [uploading, setUploading] = useState(false)
  const editFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTotalVotes()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const q = query(collection(db, 'users'))
    const querySnapshot = await getDocs(q)
    const userList: UserData[] = []
    querySnapshot.forEach((doc) => {
      userList.push({ id: doc.id, ...doc.data() } as UserData)
    })
    setUsers(userList)
  }

  const createUserAccount = async (name: string, aka: string, password: string) => {
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
      aka: aka,
      role: 'user'
    })
  }

  const handleAddUser = async () => {
    try {
      await createUserAccount(newName, newAka, newPassword)
      setNewName('')
      setNewAka('')
      setNewPassword('')
      fetchUsers()
      enqueueSnackbar('User created successfully!', { variant: 'success' })
    } catch (error) {
      console.error('Error adding user:', error)
      enqueueSnackbar((error as Error).message, { variant: 'error' })
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
          const { first_name, last_name, aka, password } = row
          if (first_name && last_name && password) {
            try {
              await createUserAccount(`${first_name} ${last_name}`, aka || '', password)
              successCount++
            } catch (err) {
              console.error(`Error creating user ${first_name} ${last_name}:`, err)
              errorCount++
            }
          }
        }
        
        fetchUsers()
        enqueueSnackbar(`Import complete. Success: ${successCount}, Errors: ${errorCount}`, { 
          variant: errorCount > 0 ? 'warning' : 'success' 
        })
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
      enqueueSnackbar('Password reset email sent!', { variant: 'info' })
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    }
  }

  const handleEditClick = (user: UserData) => {
    setEditUser(user)
    setEditName(user.name)
    setEditAka(user.aka || '')
  }

  const handleUpdateUser = async () => {
    if (!editUser) return
    try {
      await updateDoc(doc(db, 'users', editUser.id), {
        name: editName,
        aka: editAka
      })
      setEditUser(null)
      fetchUsers()
      enqueueSnackbar('User updated successfully!', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editUser) return

    setUploading(true)
    try {
      const storageRef = ref(storage, `avatars/${editUser.id}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      await updateDoc(doc(db, 'users', editUser.id), {
        photoURL: url
      })
      
      setEditUser({ ...editUser, photoURL: url })
      fetchUsers()
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success' })
    } catch (error) {
      console.error('Error uploading image:', error)
      enqueueSnackbar('Error uploading image. Make sure Storage is enabled in Firebase.', { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const playerUsers = users.filter(u => u.role === 'user')

  // Helper for colored initials
  function stringToColor(string: string) {
    let hash = 0
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = '#'
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
    }
    return color
  }

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ mb: 3 }}>
          <Tab label="Vote Totals" />
          <Tab label="Player Editing" />
          <Tab label="Import Users" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Total Votes</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Player Name</TableCell>
                    <TableCell>AKA</TableCell>
                    <TableCell align="right">Total Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {playerUsers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <Avatar 
                          src={player.photoURL} 
                          sx={{ bgcolor: player.photoURL ? 'transparent' : stringToColor(player.name) }}
                        >
                          {getInitials(player.name)}
                        </Avatar>
                      </TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.aka || '-'}</TableCell>
                      <TableCell align="right">{totalVotes[player.id] || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Manage Players</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} size="small" />
              <TextField label="AKA" value={newAka} onChange={(e) => setNewAka(e.target.value)} size="small" />
              <TextField label="Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleAddUser}>Add Player</Button>
            </Box>
            <List>
              {playerUsers.map((u) => (
                <ListItem key={u.id} divider
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => handleEditClick(u)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <Button onClick={() => handleResetPassword(u.email)}>Reset Pass</Button>
                      <IconButton edge="end" onClick={() => handleDeleteUser(u.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                                  >
                                  <Avatar 
                                    src={u.photoURL} 
                                    sx={{ mr: 2, bgcolor: u.photoURL ? 'transparent' : stringToColor(u.name) }}
                                  >
                                    {getInitials(u.name)}
                                  </Avatar>
                                  <ListItemText primary={u.name} secondary={u.aka ? `AKA: ${u.aka}` : 'No Nickname'} />
                                </ListItem>
                
              ))}
            </List>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Bulk Import</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Upload a CSV file with the following headers: <b>first_name, last_name, aka, password</b>
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                Select CSV File
                <input type="file" hidden accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} />
              </Button>
            </Paper>
          </Box>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={editUser?.photoURL} 
                  sx={{ width: 64, height: 64, bgcolor: editUser?.photoURL ? 'transparent' : stringToColor(editUser?.name || '') }}
                >
                  {editUser ? getInitials(editUser.name) : ''}
                </Avatar>
                <Button 
                  variant="outlined" 
                  component="label" 
                  disabled={uploading}
                  size="small"
                >
                  {uploading ? <CircularProgress size={20} /> : 'Change Photo'}
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} ref={editFileRef} />
                </Button>
              </Box>
              <TextField label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth />
              <TextField label="AKA / Nickname" value={editAka} onChange={(e) => setEditAka(e.target.value)} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Container>
  )
}
