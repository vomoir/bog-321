import { Card, CardContent, Typography, Button, Box } from '@mui/material'

interface PlayerCardProps {
  playerName: string
  onVote: (vote: 1 | 2 | 3) => void
}

export function PlayerCard({ playerName, onVote }: PlayerCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h5">{playerName}</Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={() => onVote(3)}>
            3 Points
          </Button>
          <Button variant="contained" onClick={() => onVote(2)}>
            2 Points
          </Button>
          <Button variant="contained" onClick={() => onVote(1)}>
            1 Point
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
