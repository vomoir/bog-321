import { useState } from 'react'
import { Container, Typography, TextField, Button, Box } from '@mui/material'
import { PlayerCard } from '../components/PlayerCard'
import { useVoteStore } from '../store/useVoteStore'
import { players } from '../constants/players'

export function VotingPage() {
  const { addVote, setGameDetails, saveVotesToFirestore } = useVoteStore()
  const [opposition, setOpposition] = useState('')
  const [gameDate, setGameDate] = useState('')

  const handleVote = (playerId: string, vote: 1 | 2 | 3) => {
    addVote({ playerId, vote })
  }

  const handleSave = () => {
    setGameDetails({ opposition, gameDate })
    saveVotesToFirestore()
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vote for the Best Players
        </Typography>
        <TextField
          label="Opposition"
          value={opposition}
          onChange={(e) => setOpposition(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Game Date"
          type="date"
          value={gameDate}
          onChange={(e) => setGameDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          playerName={player.name}
          onVote={(vote) => handleVote(player.id, vote)}
        />
      ))}
      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 4 }}>
        Save Votes
      </Button>
    </Container>
  )
}
