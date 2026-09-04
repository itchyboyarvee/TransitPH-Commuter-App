import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from '@workspace/api-client-react';
import type { AuthResponse, User } from '@workspace/api-client-react';

const TOKEN_KEY = 'transitph_session_token';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  setSession: (response: AuthResponse) => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const currentUser = useGetCurrentUser({
    query: { retry: false, queryKey: getGetCurrentUserQueryKey() },
    request: { credentials: 'include' },
  });
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const user = sessionUser ?? currentUser.data ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: currentUser.isLoading,
      setSession: async (response) => {
        await AsyncStorage.setItem(TOKEN_KEY, response.sessionToken);
        setSessionUser(response.user);
        client.setQueryData(getGetCurrentUserQueryKey(), response.user);
      },
      clearSession: async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setSessionUser(null);
        client.setQueryData(getGetCurrentUserQueryKey(), undefined);
      },
    }),
    [client, currentUser.data, currentUser.isLoading, sessionUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}