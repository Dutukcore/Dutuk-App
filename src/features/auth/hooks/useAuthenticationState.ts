import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/**
 * Authentication state interface
 */
export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
}

/**
 * Hook to manage authentication state with loading and error states
 * Provides real-time updates on authentication status
 * 
 * @returns AuthState object with session, user, loading, error, and helper flags
 */
const useAuthenticationState = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session: currentSession }, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          // If user is authenticated, fetch their role
          if (currentSession?.user) {
            await fetchUserRole(currentSession.user.id);
          }
        }
      } catch (err: any) {
        logger.error('Error initializing auth:', err?.message);
        if (mounted) {
          setError(err.message || 'Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Fetch user role from user_profiles table
    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error: roleError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (roleError) {
          logger.error('Error fetching user role');
          return;
        }

        if (mounted && data) {
          setUserRole(data.role);
        }
      } catch (err) {
        logger.error('Unexpected error fetching user role');
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        logger.log('Auth state changed:', _event);

        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          // Fetch role when user signs in
          if (newSession?.user) {
            await fetchUserRole(newSession.user.id);
          } else {
            setUserRole(null);
          }

          // Clear error on successful state change
          if (newSession) {
            setError(null);
          }
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    error,
    isAuthenticated: !!session && !!user,
    userRole,
  };
};

export default useAuthenticationState;
