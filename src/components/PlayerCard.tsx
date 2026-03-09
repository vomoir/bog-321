import { Card, CardContent, Typography, Button, Box, Avatar } from '@mui/material'

interface PlayerCardProps {
  playerName: string
  photoURL?: string
  onVote: (vote: 1 | 2 | 3) => void
  availableVotes: number[]
}

export function PlayerCard({ playerName, photoURL, onVote, availableVotes }: PlayerCardProps) {
  // Get initials from name
  const initials = playerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  // Generate a consistent background color based on the name
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          src={photoURL} 
          sx={{ 
            width: 64, 
            height: 64,
            bgcolor: photoURL ? 'transparent' : stringToColor(playerName)
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{playerName}</Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {availableVotes.includes(3) && (
              <Button variant="contained" onClick={() => onVote(3)}>
                3 Points
              </Button>
            )}
            {availableVotes.includes(2) && (
              <Button variant="contained" onClick={() => onVote(2)}>
                2 Points
              </Button>
            )}
            {availableVotes.includes(1) && (
              <Button variant="contained" onClick={() => onVote(1)}>
                1 Point
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
