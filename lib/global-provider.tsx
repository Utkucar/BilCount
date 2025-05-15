// context/GlobalProvider.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db, signUp, login as firebaseLogin, logout as firebaseLogout } from '@/services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    favLocations: string[];
    preferences?: Record<string, any>;
}

interface GlobalContextType {
    isLoggedIn: boolean;
    user: UserProfile | null;
    loading: boolean;
    refetch: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<FirebaseUser>;
    login: (email: string, password: string) => Promise<FirebaseUser>;
    logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Helper to format Firebase user into our UserProfile
async function formatUser(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const base: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.email?.split('@')[0] ?? 'User',
        email: firebaseUser.email!,
        avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email?.split('@')[0]}`,
        favLocations: []
    };

    try {
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data() as Partial<UserProfile>;
            return { ...base, ...data };
        }
    } catch (err) {
        console.warn('Failed to fetch user profile', err);
    }

    return base;
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Subscribe to auth state on mount
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser && fbUser.email) {
                const profile = await formatUser(fbUser);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Expose refetch for manual reload
    const refetch = async () => {
        const fbUser = auth.currentUser;
        if (fbUser && fbUser.email) {
            const profile = await formatUser(fbUser);
            setUser(profile);
        } else {
            setUser(null);
        }
    };

    // Wrap Firebase auth methods
    const handleSignUp = (email: string, password: string) => {
        // allowedDomain could come from env or hardcoded
        const allowedDomain = 'example.com';
        return signUp(email, password, allowedDomain);
    };
    const handleLogin = (email: string, password: string) => firebaseLogin(email, password);
    const handleLogout = () => firebaseLogout();

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                loading,
                refetch,
                signUp: handleSignUp,
                login: handleLogin,
                logout: handleLogout
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = (): GlobalContextType => {
    const ctx = useContext(GlobalContext);
    if (!ctx) {
        throw new Error('useGlobalContext must be used within GlobalProvider');
    }
    return ctx;
};
