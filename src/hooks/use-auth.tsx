
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

  const defaultAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='feather feather-user'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E`;

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
        avatar: firebaseUser.photoURL || defaultAvatar,
        plan: 'Free',
        headline: '',
        location: '',
        about: '',
      };
      setProfile(defaultProfile);
    }
  }, [defaultAvatar]);

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
                avatar: firebaseUser.photoURL || defaultAvatar,
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
  }, [defaultAvatar]);

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
