import { create } from 'zustand'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

interface AuthState {
  user: User | null
  role: 'admin' | 'user' | null
  loading: boolean
  error: string | null
  signIn: (email: string, pass: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => Promise<void>
}

const auth = getAuth()

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  error: null,
  setUser: async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      set({ user, role: userData?.role || 'user', loading: false })
    } else {
      set({ user: null, role: null, loading: false })
    }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // onAuthStateChanged will handle setUser
    } catch (error) {
      set({ loading: false, error: (error as Error).message })
    }
  },
  signOut: async () => {
    set({ loading: true, error: null })
    try {
      await signOut(auth)
      set({ user: null, role: null, loading: false })
    } catch (error) {
      set({ loading: false, error: (error as Error).message })
    }
  },
}))

onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user)
})
