// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import {
    collection,
    getDocs,
    query as firestoreQuery,
    orderBy,
    limit as firestoreLimit,
    where,
    doc,
    getDoc,
} from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDzcASVCY1bl0PTqpuCVqjhjaMwyAHOLHw",
    authDomain: "bilcount-bf448.firebaseapp.com",
    databaseURL: "https://bilcount-bf448-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bilcount-bf448",
    storageBucket: "bilcount-bf448.firebasestorage.app",
    messagingSenderId: "515265497784",
    appId: "1:515265497784:web:1c76f89bd06fae9a1d024d",
};

const app = initializeApp(firebaseConfig);

// Authentication (in-memory persistence)
export const auth = getAuth(app);

// Firestore with long-polling for React Native listeners
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// Realtime Database
export const realtimeDB = getDatabase(app);

// -----------------------------
// Authentication API
// -----------------------------
export async function signUp(
    email: string,
    password: string,
    allowedDomain: string
): Promise<User> {
    if (!email.endsWith(`@${allowedDomain}`)) {
        throw new Error(`Email must be a ${allowedDomain} address`);
    }
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return userCred.user;
}

export async function login(
    email: string,
    password: string
): Promise<User> {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
}

export async function logout(): Promise<void> {
    await signOut(auth);
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// -----------------------------
// Firestore Data Access
// -----------------------------
export interface Location {
    id: string;
    locationID?: string;
    name: string;
    description?: string;
    image?: string;
    capacity?: number;
    coordinates?: { latitude: number; longitude: number };
    floorCount?: number;
    createdAt?: string;
    [key: string]: any;
}

export async function getLatestLocations(
    limitCount: number = 5
): Promise<Location[]> {
    const q = firestoreQuery(
        collection(db, 'locations'),
        orderBy('createdAt', 'asc'),
        firestoreLimit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }));
}

export interface GetLocationsParams {
    filter?: string;
    query?: string;
    limit?: number;
}

export async function getLocations({
                                       filter,
                                       query: _search,
                                       limit: limitCount,
                                   }: GetLocationsParams): Promise<Location[]> {
    const constraints: any[] = [];
    if (filter && filter !== 'All') {
        constraints.push(where('type', '==', filter));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    if (limitCount) {
        constraints.push(firestoreLimit(limitCount));
    }

    const q = firestoreQuery(collection(db, 'locations'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }));
}

export async function getLocationById(
    id: string
): Promise<Location | null> {
    const docRef = doc(db, 'locations', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
        ? ({ id: docSnap.id, ...(docSnap.data() as any) } as Location)
        : null;
}
