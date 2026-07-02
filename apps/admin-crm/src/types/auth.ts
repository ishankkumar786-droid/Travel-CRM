import type { UserDTO } from '@travel/types';

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserDTO; accessToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: { user: UserDTO; accessToken: string } };
