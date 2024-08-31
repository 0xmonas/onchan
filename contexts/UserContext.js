import { createContext, useState, useEffect } from 'react';
import { usePrivyWeb3 } from './PrivyWeb3Context';
import { getUserProfile } from '../services/userService';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const { isConnected, account, user } = usePrivyWeb3();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isConnected && account) {
        try {
          const userProfile = await getUserProfile(account);
          if (userProfile) {
            setCurrentUser(userProfile);
          } else {
            setCurrentUser({ address: account });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser({ address: account });
        }
      } else {
        setCurrentUser(null);
      }
    };
  
    fetchUserProfile();
  }, [isConnected, account, user]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}