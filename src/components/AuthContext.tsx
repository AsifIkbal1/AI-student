import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, addDoc, collection, serverTimestamp, getDocFromServer, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "../firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "user" | "admin";
  credits: number;
  subscription: {
    plan: "free" | "pro" | "premium";
    expiresAt: string;
    active: boolean;
  };
  isBlocked?: boolean;
  isApproved?: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Listen to profile changes
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;

            // Sync latest Google photo & name into Firestore if outdated
            const needsUpdate =
              (user.photoURL && data.photoURL !== user.photoURL) ||
              (user.displayName && data.displayName !== user.displayName);

            if (needsUpdate) {
              updateDoc(userDocRef, {
                ...(user.photoURL ? { photoURL: user.photoURL } : {}),
                ...(user.displayName ? { displayName: user.displayName } : {}),
              }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
              // Update local state immediately so UI reflects the change
              setProfile({ ...data, photoURL: user.photoURL || data.photoURL, displayName: user.displayName || data.displayName });
            } else {
              setProfile(data);
            }
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "Student",
              photoURL: user.photoURL || "",
              role: user.email === "mdasifikbal2050@gmail.com" ? "admin" : "user",
              credits: 1000,
              subscription: {
                plan: "free",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                active: true,
              },
              isBlocked: false,
              isApproved: false,
              createdAt: new Date().toISOString(),
            };
            setDoc(userDocRef, newProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
            setProfile(newProfile);

            // Sync signup to MySQL
            fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Student",
                photoURL: user.photoURL || "",
                isLogin: false
              })
            }).catch(console.error);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await addDoc(collection(db, "loginLogs"), {
          uid: result.user.uid,
          email: result.user.email,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent
        });

        // Sync login to MySQL
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || "Student",
            photoURL: result.user.photoURL || "",
            isLogin: true
          })
        }).catch(console.error);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "loginLogs");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deductCredits = async (amount: number) => {
    if (!user || !profile) return false;
    
    // Admins have unlimited credits
    if (profile.role === "admin") return true;
    
    if (profile.credits < amount) return false;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        credits: increment(-amount)
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, deductCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
