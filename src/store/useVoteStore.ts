import { create } from 'zustand'
import { db } from '../firebase/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

interface Vote {
  playerId: string
  vote: 1 | 2 | 3
}

interface GameDetails {
  opposition: string
  gameDate: string
}

interface VoteState extends GameDetails {
  votes: Vote[]
  totalVotes: Record<string, number>
  loading: boolean
  addVote: (vote: Vote) => void
  setGameDetails: (details: GameDetails) => void
  saveVotesToFirestore: () => Promise<void>
  fetchTotalVotes: () => Promise<void>
}

export const useVoteStore = create<VoteState>((set, get) => ({
  votes: [],
  totalVotes: {},
  opposition: '',
  gameDate: '',
  loading: false,
  addVote: (vote) => set((state) => ({ votes: [...state.votes, vote] })),
  setGameDetails: (details) => set(() => ({ ...details })),
  saveVotesToFirestore: async () => {
    const { opposition, gameDate, votes } = get()
    try {
      await addDoc(collection(db, 'votes'), {
        opposition,
        gameDate,
        votes,
        createdAt: new Date(),
      })
      console.log('Votes saved to Firestore successfully!')
    } catch (error) {
      console.error('Error saving votes to Firestore: ', error)
    }
  },
  fetchTotalVotes: async () => {
    set({ loading: true })
    try {
      const querySnapshot = await getDocs(collection(db, 'votes'))
      const totals: Record<string, number> = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.votes) {
          data.votes.forEach((v: Vote) => {
            totals[v.playerId] = (totals[v.playerId] || 0) + v.vote
          })
        }
      })
      set({ totalVotes: totals, loading: false })
    } catch (error) {
      console.error('Error fetching votes: ', error)
      set({ loading: false })
    }
  },
}))
