
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRecord } from '../types';

// Helper to get or generate device ID
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
};

// Helper to get client IP
const getClientIp = async () => {
  try {
    const res = await fetch('/api/ip');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    console.warn("Could not fetch IP:", e);
    return 'unknown';
  }
};

interface AuthContextType {
  currentUser: UserRecord | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await refreshUser(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const refreshUser = async (uid?: string) => {
    const targetUid = uid || currentUser?.id;
    if (!targetUid) return;

    try {
      const userDocRef = doc(db, 'users', targetUid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const deviceId = getDeviceId();
        const ip = await getClientIp();

        // Update metadata if changed, but don't loop
        if (data.deviceId !== deviceId || data.lastIp !== ip) {
          updateDoc(userDocRef, { 
            deviceId, 
            lastIp: ip, 
            lastLogin: new Date() 
          }).catch(e => console.warn("Failed to update user metadata:", e));
        }
        
        const userData = { id: targetUid, ...data } as UserRecord;
        setCurrentUser(userData);
      } else if (uid) {
        // Only create if we have a fresh UID from onAuthStateChanged
        const deviceId = getDeviceId();
        const ip = await getClientIp();
        const isAdmin = auth.currentUser?.email === 'admin@demo.com' || auth.currentUser?.email === 'aegy238@gmail.com';
        
        const basicUserData: UserRecord = {
          id: targetUid,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || 'User',
          role: isAdmin ? 'admin' : 'user',
          isApproved: true,
          isVIP: false,
          status: 'active',
          subscriptionType: 'none',
          freeAttempts: 5,
          coins: 0,
          subscriptionExpiry: new Date(),
          createdAt: new Date(),
          lastLogin: new Date(),
          deviceId,
          lastIp: ip
        };

        await setDoc(userDocRef, basicUserData);
        setCurrentUser(basicUserData);
      }
    } catch (err: any) {
      if (err.code === 'resource-exhausted') {
        console.warn("Quota exceeded in refreshUser. Using cached user data.");
      } else {
        console.warn("Error refreshing user data:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    const isAdmin = email === 'admin@demo.com' || email === 'aegy238@gmail.com';
    const deviceId = getDeviceId();
    const ip = await getClientIp();
    
    let defaultFreeAttempts = 5;
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        defaultFreeAttempts = data.defaultFreeAttempts ?? 5;
      }
    } catch (e) {
      console.warn("Could not fetch settings for default attempts:", e);
    }

    const newUserData: Omit<UserRecord, 'id'> = {
      name,
      email,
      role: isAdmin ? 'admin' : 'user',
      isApproved: true,
      isVIP: false,
      status: 'active',
      subscriptionType: 'none',
      freeAttempts: defaultFreeAttempts,
      coins: 0,
      subscriptionExpiry: new Date(),
      createdAt: new Date(),
      lastLogin: new Date(),
      deviceId,
      lastIp: ip
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid), newUserData);
      setCurrentUser({ id: user.uid, ...newUserData });
    } catch (err) {
      console.error("Firestore Write Error:", err);
      // Even if Firestore write fails, we set the local state so the user can proceed
      setCurrentUser({ id: user.uid, ...newUserData });
      // We might want to alert the user, but for now, logging is enough.
      // The UI will just work with the in-memory user object.
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
