// components/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.actions';

type User = {
  id: string;
  name: string;
  email: string;
  // Add any other user fields returned by getLoggedInUser()
};

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getLoggedInUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
export const useUser = () => useContext(UserContext);
