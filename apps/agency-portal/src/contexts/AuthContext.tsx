'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ReactNode } from 'react';

import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/api-client';

import type { AuthAction, AuthState } from '@/types/auth';
import { authApi } from '@/services/auth.api';

// ─── Reducer ──────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { user: null, accessToken: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const REFRESH_BUFFER_MS = 60_000; // refresh 1 min before expiry

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((expiresInSeconds: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const delay = Math.max(expiresInSeconds * 1000 - REFRESH_BUFFER_MS, 10_000);
    refreshTimerRef.current = setTimeout(() => {
      authApi
        .refresh()
        .then(({ accessToken, expiresIn }) => {
          setAccessToken(accessToken, expiresIn);
          scheduleRefresh(expiresIn);
        })
        .catch(() => dispatch({ type: 'LOGOUT' }));
    }, delay);
  }, []);

  // ─── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    authApi
      .getMe()
      .then((user) => {
        dispatch({ type: 'RESTORE_SESSION', payload: { user, accessToken: token } });
        authApi
          .refresh()
          .then(({ accessToken, expiresIn }) => {
            setAccessToken(accessToken, expiresIn);
            scheduleRefresh(expiresIn);
          })
          .catch(() => {
            clearAccessToken();
            dispatch({ type: 'LOGOUT' });
          });
      })
      .catch(() => {
        clearAccessToken();
        dispatch({ type: 'SET_LOADING', payload: false });
      });

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, _rememberMe = false) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authApi.login(email, password);
      setAccessToken(result.accessToken, result.expiresIn);
      scheduleRefresh(result.expiresIn);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: result.user, accessToken: result.accessToken },
      });
    },
    [scheduleRefresh],
  );

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await authApi.logout().catch(() => null); // best-effort
    clearAccessToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const logoutAll = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await authApi.logoutAll().catch(() => null);
    clearAccessToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, logoutAll }),
    [state, login, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
