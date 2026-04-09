import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import type { AuthUser, AuthContextType } from '../types/index.js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({
        sub: currentUser.userId,
        email: attributes.email ?? '',
        name: attributes.name,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const result = await signIn({ username, password });
    if (result.isSignedIn) {
      await checkAuth();
    }
  };

  const signup = async (username: string, email: string, password: string, name: string, phone: string) => {
    await signUp({
      username,
      password,
      options: {
        userAttributes: { email, name, phone_number: phone },
      },
    });
  };

  const confirmSignupFn = async (username: string, code: string) => {
    await confirmSignUp({ username, confirmationCode: code });
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        confirmSignup: confirmSignupFn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}