import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// Collection name for users
const USERS_COLLECTION = "users";

// User interface
export interface User {
    id: string;
    email: string;
    createdAt?: Timestamp;
    lastLogin?: Timestamp;
    name?: string;
    role?: string;
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const userDoc = querySnapshot.docs[0];
        return {
            id: userDoc.id,
            ...userDoc.data(),
        } as User;
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

/**
 * Find a user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return null;
        }

        return {
            id: userDoc.id,
            ...userDoc.data(),
        } as User;
    } catch (error) {
        console.error("Error finding user by ID:", error);
        throw error;
    }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
    email: string,
    password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const user = await signInWithEmailAndPassword(auth, email, password);

        if (!user) {
            return {
                success: false,
                error: "User not found.",
            };
        }

        // // Simple password comparison (in production, use bcrypt or similar)
        // if (user.password !== password) {
        //   return {
        //     success: false,
        //     error: "Invalid email or password",
        //   };
        // }

        // Update last login time
        // await updateUserLastLogin(user.id);
        const userData = {
            email,
            id: user.user.uid,
        };
        return {
            success: true,
            user: userData,
        };
    } catch (error) {
        console.error("Error authenticating user:", error);
        return {
            success: false,
            error: "Authentication failed. Please try again.",
        };
    }
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            lastLogin: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating last login:", error);
        // Don't throw error, as this is not critical for login
    }
}

/**
 * Create a new user (admin function)
 */
export async function createUser(userData: {
    email: string;
    password: string;
    name?: string;
    role?: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
        // Check if user already exists
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            return {
                success: false,
                error: "User with this email already exists",
            };
        }

        const usersRef = collection(db, USERS_COLLECTION);
        const newUserRef = doc(usersRef);

        await setDoc(newUserRef, {
            email: userData.email,
            password: userData.password,
            name: userData.name || "",
            role: userData.role || "user",
            createdAt: Timestamp.now(),
            lastLogin: null,
        });

        return {
            success: true,
            userId: newUserRef.id,
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: "Failed to create user. Please try again.",
        };
    }
}

/**
 * Update user information
 */
export async function updateUser(
    userId: string,
    updates: Partial<User>
): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, updates);

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: "Failed to update user. Please try again.",
        };
    }
}

/**
 * Delete a user
 */
export async function deleteUser(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await deleteDoc(userRef);

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: "Failed to delete user. Please try again.",
        };
    }
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const querySnapshot = await getDocs(usersRef);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as User[];
    } catch (error) {
        console.error("Error getting all users:", error);
        throw error;
    }
}