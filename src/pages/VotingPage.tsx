import { useState, useEffect } from 'react'
import { Container, Typography, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import DodoIcon from '../components/DodoIcon'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { PlayerCard } from '../components/PlayerCard'
import { useVoteStore } from '../store/useVoteStore'
import { useAuthStore } from '../store/useAuthStore'
import { db } from '../firebase/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useSnackbar } from 'notistack'

export function VotingPage() {
  const { votes, addVote, setGameDetails, saveVotesToFirestore } = useVoteStore()
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuthStore()
  const [opposition, setOpposition] = useState('')
  const [gameDate, setGameDate] = useState<Dayjs | null>(dayjs())
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [dbPlayers, setDbPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'user'))
        const querySnapshot = await getDocs(q)
        const playerList: any[] = []
        querySnapshot.forEach((doc) => {
          playerList.push({ id: doc.id, ...doc.data() })
        })
        setDbPlayers(playerList)
      } catch (err) {
        console.error('Error fetching players:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handleVote = (vote: 1 | 2 | 3) => {
    if (selectedPlayerId) {
      addVote({ playerId: selectedPlayerId, vote })
      setSelectedPlayerId('') // Reset selection after voting
    }
  }

  const handleSave = async () => {
    setGameDetails({ 
      opposition, 
      gameDate: gameDate ? gameDate.format('YYYY-MM-DD') : '' 
    })
    try {
      await saveVotesToFirestore()
      enqueueSnackbar('Votes saved successfully!', { variant: 'success' })
    } catch (err) {
      enqueueSnackbar('Error saving votes', { variant: 'error' })
    }
  }

  // Determine which point values have already been cast
  const castPointValues = votes.map(v => v.vote)
  const availablePointValues = ([3, 2, 1] as const).filter(
    (val) => !castPointValues.includes(val)
  )

  // Filter out:
  // 1. Players who have already been voted for
  // 2. The current user (to prevent self-voting)
  const availablePlayers = dbPlayers.filter(
    (player) => !votes.some((v) => v.playerId === player.id) && player.id !== user?.uid
  )

  const selectedPlayer = dbPlayers.find((p) => p.id === selectedPlayerId)

  if (loading) return <Typography sx={{ p: 4 }}>Loading players...</Typography>

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Box sx={{ my: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <DodoIcon size={48} color="#1976d2" />
          <Typography variant="h4" component="h1">
            Cast Your Votes
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            label="Opposition"
            value={opposition}
            onChange={(e) => setOpposition(e.target.value)}
            fullWidth
            margin="normal"
          />
          <DatePicker
            label="Game Date"
            value={gameDate}
            onChange={(newValue) => setGameDate(newValue)}
            format="DD/MM/YYYY"
            sx={{ width: '100%', mt: 2 }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth disabled={availablePointValues.length === 0}>
            <InputLabel id="player-select-label">Select Player</InputLabel>
            <Select
              labelId="player-select-label"
              id="player-select"
              value={selectedPlayerId}
              label="Select Player"
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              {availablePlayers.map((player) => (
                <MenuItem key={player.id} value={player.id}>
                  {player.name} {player.aka ? `(${player.aka})` : ''}
                </MenuItem>
              ))}
              {availablePlayers.length === 0 && (
                <MenuItem disabled>No more players to vote for</MenuItem>
              )}
            </Select>
          </FormControl>
          {availablePointValues.length === 0 && (
            <Typography color="primary" sx={{ mt: 1 }}>
              All votes (3, 2, and 1 points) have been cast.
            </Typography>
          )}
        </Box>

        {selectedPlayer && (
          <PlayerCard
            playerName={selectedPlayer.aka ? `${selectedPlayer.name} (${selectedPlayer.aka})` : selectedPlayer.name}
            photoURL={selectedPlayer.photoURL}
            onVote={handleVote}
            availableVotes={availablePointValues}
          />
        )}

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd' }}>
          <Typography variant="h6">Votes Cast: {votes.length}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            sx={{ mt: 2 }}
            disabled={votes.length === 0}
          >
            Save All Votes
          </Button>
        </Box>
      </Container>
    </LocalizationProvider>
  )
}
