import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserData } from '../types';

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (err) {
          setError('Kunde inte hämta användardata');
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (newData: Partial<UserData>) => {
    if (!user) throw new Error('Ingen användare inloggad');
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        ...newData,
        lastUpdated: Date.now()
      }, { merge: true });
      
      setUserData((prev: UserData | null) => prev ? { ...prev, ...newData } : null);
    } catch (err) {
      setError('Kunde inte uppdatera användardata');
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, userData, loading, error, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser måste användas inom en UserProvider');
  }
  return context;
}; 