// services/firebase.ts
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    getDocs,
    query as firestoreQuery,
    orderBy,
    limit as firestoreLimit,
    where,
    doc,
    getDoc,
    DocumentData,
} from 'firebase/firestore';

// Initialize Firebase using your .env variables
const firebaseConfig = {
    apiKey: "AIzaSyDzcASVCY1bl0PTqpuCVqjhjaMwyAHOLHw",
    authDomain: "bilcount-bf448.firebaseapp.com",
    databaseURL: "https://bilcount-bf448-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bilcount-bf448",
    storageBucket: "bilcount-bf448.firebasestorage.app",
    messagingSenderId: "515265497784",
    appId: "1:515265497784:web:1c76f89bd06fae9a1d024d",
    measurementId: "G-J8HLVTPLME"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// -----------------------------
// Authentication
// -----------------------------

/**
 * Sign up a user with email/password, only if email uses the allowedDomain
 */
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

/**
 * Log in an existing user
 */
export async function login(
    email: string,
    password: string
): Promise<User> {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
    await signOut(auth);
}

/**
 * Get the currently signed-in user, or null
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// -----------------------------
// Firestore Data Access
// -----------------------------

/**
 * Fetch the latest properties ordered by creation date (ascending)
 */
export async function getLatestProperties(
    limitCount: number = 5
): Promise<DocumentData[]> {
    const q = firestoreQuery(
        collection(db, 'properties'),
        orderBy('createdAt', 'asc'),
        firestoreLimit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export interface GetPropertiesParams {
    filter?: string;
    query?: string;
    limit?: number;
}

/**
 * Fetch properties with optional filtering and client-side search
 */
export async function getProperties({
                                        filter,
                                        query: searchQuery,
                                        limit: limitCount,
                                    }: GetPropertiesParams): Promise<DocumentData[]> {
    const constraints: any[] = [];
    if (filter && filter !== 'All') {
        constraints.push(where('type', '==', filter));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    if (limitCount) {
        constraints.push(firestoreLimit(limitCount));
    }

    const q = firestoreQuery(collection(db, 'properties'), ...constraints);
    const snap = await getDocs(q);
    let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        results = results.filter(item =>
            (item.name as string).toLowerCase().includes(lower) ||
            (item.address as string).toLowerCase().includes(lower) ||
            (item.type as string).toLowerCase().includes(lower)
        );
    }

    return results;
}

/**
 * Fetch a single property by its document ID
 */
export async function getPropertyById(
    id: string
): Promise<DocumentData | null> {
    const docRef = doc(db, 'properties', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}
