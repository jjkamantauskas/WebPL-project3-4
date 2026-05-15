import { createContext, useContext } from 'react';
import { useMe } from '../lib/queries/useMe';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data, isLoading } = useMe();

  return (
    <AuthContext.Provider
      value={{
        user: data || null,
        loading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
