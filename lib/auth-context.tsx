"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"

import { type SocialNetworkId } from "@/lib/social-networks"

interface AuthContextType {
  user: User | null
  loading: boolean
  onboardingCompleted: boolean
  signInWithGoogle: () => Promise<void>
  signInAnon: () => Promise<void>
  signOut: () => Promise<void>
  completeOnboarding: (selectedNetworks?: SocialNetworkId[]) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  onboardingCompleted: false,
  signInWithGoogle: async () => {},
  signInAnon: async () => {},
  signOut: async () => {},
  completeOnboarding: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Ensure user doc exists
        const userRef = doc(db, "users", firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: firebaseUser.displayName || "Anonymous Warrior",
            currentStreak: 0,
            bestStreak: 0,
            lastCheckDate: null,
            onboardingCompleted: false,
            isAnonymous: firebaseUser.isAnonymous,
            createdAt: serverTimestamp(),
          })
          setOnboardingCompleted(false)
        } else {
          // Check if onboarding was completed
          const userData = userSnap.data()
          setOnboardingCompleted(userData?.onboardingCompleted ?? false)
          // Update isAnonymous status if user linked account
          if (userData?.isAnonymous !== firebaseUser.isAnonymous) {
            await setDoc(userRef, { isAnonymous: firebaseUser.isAnonymous }, { merge: true })
          }
        }
      } else {
        setUser(null)
        setOnboardingCompleted(false)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signInAnon = async () => {
    await signInAnonymously(auth)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const completeOnboarding = async (selectedNetworks?: SocialNetworkId[]) => {
    if (!user) {
      console.error("No user found for completeOnboarding")
      return
    }
    try {
      const userRef = doc(db, "users", user.uid)
      const updateData: Record<string, unknown> = { onboardingCompleted: true }
      if (selectedNetworks && selectedNetworks.length > 0) {
        updateData.selectedNetworks = selectedNetworks
        updateData.dailyResults = []
        updateData.averageScore = 0
      }
      await setDoc(userRef, updateData, { merge: true })
      setOnboardingCompleted(true)
    } catch (e) {
      console.error("Error completing onboarding:", e)
      // Still update local state so user can proceed
      setOnboardingCompleted(true)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, onboardingCompleted, signInWithGoogle, signInAnon, signOut, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
