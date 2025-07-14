
'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { type User as ProfileUser } from '@/lib/data';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: ProfileUser | null;
  loading: boolean;
  logout: () => void;
  reloadProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setProfile(userDocSnap.data() as ProfileUser);
    } else {
      // Create a default profile if one doesn't exist
      const defaultProfile: ProfileUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'New User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`,
        plan: 'Free',
        headline: '',
        location: '',
        about: '',
      };
      setProfile(defaultProfile);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Set up a real-time listener for the user's profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile({ id: doc.id, ...doc.data() } as ProfileUser);
          } else {
             // Handle case where profile might not exist yet
            setProfile({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "New User",
                email: firebaseUser.email || "",
                avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`,
                plan: "Free",
                headline: "",
                location: "",
                about: "",
            });
          }
           setLoading(false);
        });
         return () => unsubProfile(); // Cleanup the profile listener
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the auth listener
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const reloadProfile = useCallback(() => {
    if (user) {
      fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const value = {
    user,
    profile,
    loading,
    logout,
    reloadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
